<!--* app/components/SearchBar.vue -->

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '../types';
import { Search, X, Plus, MapPin, Crosshair, Loader2 } from '@lucide/vue';

const props = withDefaults(defineProps<{
  variant?: 'desktop' | 'mobile';
}>(), {
  variant: 'desktop',
});

const store = usePlacesStore();
const ui = useUIStore();

interface WorldResult {
  lat: number;
  lng: number;
  name: string;
  display_name: string;
  address: Record<string, string>;
}

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const isSearching = ref(false);
const worldResults = ref<WorldResult[]>([]);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const query = computed({
  get: () => store.searchQuery,
  set: (val: string) => { store.searchQuery = val; },
});

const showDropdown = computed(() => query.value.trim().length > 0);

const savedMatches = computed(() => store.filteredPlaces.slice(0, 5));

watch(query, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  const trimmed = q.trim();
  if (!trimmed) {
    worldResults.value = [];
    isSearching.value = false;
    return;
  }
  isSearching.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/nominatim/search?limit=5&accept-language=en&q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      worldResults.value = (data || []).map((r: any) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        name: r.name || String(r.display_name || '').split(',')[0],
        display_name: r.display_name || '',
        address: r.address || {},
      }));
    } catch (e) {
      console.error(e);
      worldResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 350);
});

function clearQuery() {
  store.searchQuery = '';
}

function closeDropdown() {
  isOpen.value = false;
}

function selectSaved(place: Place) {
  store.selectPlace(place.id);
  clearQuery();
  closeDropdown();
  if (ui.activeModal === 'search') ui.closeModal();
  if (window.innerWidth < 768) ui.setMobileView('map');
}

function shortAddress(displayName: string): string {
  return displayName.split(',').slice(0, 3).join(',');
}

function pickArea(address?: Record<string, string>): string {
  if (!address) return '';
  return (
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.town ||
    address.village ||
    address.city ||
    address.municipality ||
    ''
  );
}

function previewWorldPlace(r: WorldResult) {
  clearQuery();
  closeDropdown();
  if (ui.activeModal === 'search') ui.closeModal();
  if (window.innerWidth < 768) ui.setMobileView('map');
  ui.panToCoordinates(r.lat, r.lng);
}

function addWorldPlace(r: WorldResult) {
  closeDropdown();
  if (ui.activeModal === 'search') ui.closeModal();
  ui.prefillPlace({
    name: r.name,
    area: pickArea(r.address),
    address: shortAddress(r.display_name),
    lat: r.lat,
    lng: r.lng,
    status: 'want',
  });
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <div
    ref="rootRef"
    class="relative w-full"
    @keydown.escape="closeDropdown"
  >
    <div class="relative flex items-center">
      <Search class="w-4 h-4 absolute left-3 text-text-tertiary pointer-events-none" />
      <input
        v-model="query"
        type="search"
        placeholder="Search place, cuisine, area..."
        aria-label="Search your places and the world"
        @focus="isOpen = true"
        class="w-full pl-9 pr-8 bg-bg-secondary border border-border rounded-full focus:outline-none focus:border-primary text-text-primary transition-all placeholder:text-text-tertiary"
        :class="variant === 'desktop' ? 'py-1.5 text-xs' : 'py-2 text-sm'"
      />
      <button
        v-if="query"
        @click="clearQuery()"
        class="absolute right-2.5 text-text-tertiary hover:text-text-primary p-0.5"
        aria-label="Clear search">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showDropdown && isOpen"
        class="absolute z-50 mt-1 left-0 right-0 rounded-xl bg-surface border border-border shadow-xl overflow-hidden"
      >
        <template v-if="savedMatches.length">
          <p class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">In your places</p>
          <button
            v-for="p in savedMatches"
            :key="p.id"
            @click="selectSaved(p)"
            class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-secondary transition-colors"
          >
            <MapPin class="w-3.5 h-3.5 shrink-0 text-primary" />
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-semibold text-text-primary truncate">{{ p.name }}</span>
              <span class="block text-[10px] text-text-tertiary truncate">{{ p.cuisine }} • {{ p.area }}</span>
            </span>
            <span class="shrink-0 text-[10px] font-bold" :class="p.status === 'ranked' ? 'text-primary' : 'text-highlight-strong'">
              {{ p.status === 'ranked' ? `#${p.rank}` : '★' }}
            </span>
          </button>
        </template>

        <template v-if="worldResults.length">
          <p class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Around the world</p>
          <div
            v-for="(r, i) in worldResults"
            :key="`w-${i}`"
            class="flex items-center gap-1 pr-2"
          >
            <button
              @click="previewWorldPlace(r)"
              class="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-secondary transition-colors"
              :aria-label="`View ${r.name} on the map`"
            >
              <Crosshair class="w-3.5 h-3.5 shrink-0 text-text-tertiary" />
              <span class="min-w-0 flex-1">
                <span class="block text-xs font-semibold text-text-primary truncate">{{ r.name }}</span>
                <span class="block text-[10px] text-text-tertiary truncate">{{ shortAddress(r.display_name) }}</span>
              </span>
            </button>
            <button
              @click="addWorldPlace(r)"
              class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold hover:bg-primary-hover transition-colors active:scale-95"
              :aria-label="`Add ${r.name} to your places`"
            >
              <Plus class="w-3 h-3" />
              Add
            </button>
          </div>
        </template>

        <div v-if="isSearching" class="px-3 py-2.5 flex items-center gap-2 text-[11px] text-text-tertiary">
          <Loader2 class="w-3.5 h-3.5 animate-spin" />
          Searching around the world...
        </div>

        <div v-if="!isSearching && savedMatches.length === 0 && worldResults.length === 0" class="px-3 py-2.5 text-[11px] text-text-tertiary">
          No matches. Try a restaurant, city or neighborhood.
        </div>
      </div>
    </Transition>
  </div>
</template>
