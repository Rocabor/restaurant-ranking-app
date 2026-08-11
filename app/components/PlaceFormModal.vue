 <!--* app\components\PlaceFormModal.vue  -->

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '../types';
import { X, Search, MapPin } from '@lucide/vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { placeFormSchema } from '~/utils/schemas';
import { useFocusTrap } from '../composables/useFocusTrap';

const store = usePlacesStore();
const ui = useUIStore();

const isOpen = computed(() => ui.activeModal === 'addPlace' || ui.activeModal === 'editPlace');
const isEditing = computed(() => ui.activeModal === 'editPlace');

const modalRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(modalRef);

watch(isOpen, (open) => {
  if (open) {
    activate();
  } else {
    deactivate();
  }
});

function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') {
    ui.closeModal();
  }
}

const { handleSubmit, errors, resetForm, setValues, values } = useForm({
  validationSchema: toTypedSchema(placeFormSchema),
  initialValues: {
    name: '',
    cuisine: '',
    specialty: '',
    area: '',
    address: '',
    lat: 51.5155,
    lng: -0.098,
    priceLevel: 2 as 1 | 2 | 3 | 4,
    status: 'want' as 'want' | 'ranked',
    note: '',
    tags: '',
    website: '',
  },
});

const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: cuisine, errorMessage: cuisineError } = useField<string>('cuisine');
const { value: specialty } = useField<string>('specialty');
const { value: area, errorMessage: areaError } = useField<string>('area');
const { value: address, errorMessage: addressError } = useField<string>('address');
const { value: lat, errorMessage: latError } = useField<number>('lat');
const { value: lng, errorMessage: lngError } = useField<number>('lng');
const { value: priceLevel } = useField<1 | 2 | 3 | 4>('priceLevel');
const { value: status } = useField<'want' | 'ranked'>('status');
const { value: note } = useField<string>('note');
const { value: tags } = useField<string>('tags');
const { value: website, errorMessage: websiteError } = useField<string>('website');

const isGeocoding = ref(false);

interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

const geocodeResults = ref<GeocodeResult[]>([]);
const noGeocodeResults = ref(false);

watch(() => ui.activeModal, (val) => {
  if (val === 'editPlace' && store.editingPlace) {
    setValues({
      name: store.editingPlace.name,
      cuisine: store.editingPlace.cuisine,
      specialty: store.editingPlace.specialty || '',
      area: store.editingPlace.area,
      address: store.editingPlace.address,
      lat: store.editingPlace.lat,
      lng: store.editingPlace.lng,
      priceLevel: store.editingPlace.priceLevel,
      status: store.editingPlace.status,
      note: store.editingPlace.note || '',
      tags: (store.editingPlace.tags || []).join(', '),
      website: store.editingPlace.website || '',
    });
    noGeocodeResults.value = false;
    applyPendingPinCoords();
  } else if (val === 'addPlace') {
    if (ui.placePrefill) {
      const p = ui.placePrefill;
      setValues({
        name: p.name || '',
        cuisine: p.cuisine || '',
        specialty: p.specialty || '',
        area: p.area || '',
        address: p.address || '',
        lat: p.lat ?? 51.5155,
        lng: p.lng ?? -0.098,
        priceLevel: p.priceLevel || 2,
        status: p.status || 'want',
        note: p.note || '',
        tags: p.tags || '',
        website: p.website || '',
      });
      ui.placePrefill = null;
    } else {
      resetForm();
    }
    noGeocodeResults.value = false;
    applyPendingPinCoords();
  }
});

function applyPendingPinCoords() {
  if (!ui.pendingPinCoords) return;
  const c = ui.pendingPinCoords;
  setValues({ lat: c.lat, lng: c.lng });
  ui.pendingPinCoords = null;
  reverseGeocode(c.lat, c.lng);
}

watch([name, address, area], () => {
  noGeocodeResults.value = false;
});

async function searchGeocode() {
  if (!address.value && !name.value && !area.value) return;
  isGeocoding.value = true;
  geocodeResults.value = [];
  noGeocodeResults.value = false;

  const candidates = Array.from(new Set([
    [name.value, address.value, area.value].filter(Boolean).join(' '),
    [name.value, area.value].filter(Boolean).join(' '),
    name.value,
    [address.value, area.value].filter(Boolean).join(' '),
    address.value,
    area.value,
  ].map((s) => s.trim()).filter(Boolean)));

  try {
    for (const query of candidates) {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=en&q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data && data.length > 0) {
        geocodeResults.value = data.slice(0, 6).map((r: any) => ({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          display_name: r.display_name,
        }));
        break;
      }
    }

    if (geocodeResults.value.length === 0) {
      noGeocodeResults.value = true;
    }
  } catch (e) {
    console.error(e);
    noGeocodeResults.value = true;
  } finally {
    isGeocoding.value = false;
  }
}

function applyGeocodeResult(r: GeocodeResult) {
  setValues({
    lat: r.lat,
    lng: r.lng,
    address: r.display_name.split(',').slice(0, 3).join(','),
  });
  geocodeResults.value = [];
  noGeocodeResults.value = false;
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=en`);
    const data = await res.json();
    if (data && data.display_name) {
      const parts = String(data.display_name).split(',').map((s: string) => s.trim()).filter(Boolean);
      if (!address.value && parts.length > 0) {
        address.value = parts.slice(0, 3).join(', ');
      }
      if (!area.value && parts.length > 3) {
        area.value = parts[Math.min(3, parts.length - 1)] ?? '';
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function mapCuisineToGroup(c: string): string {
  const lower = c.toLowerCase();
  if (lower.includes('basque') || lower.includes('spanish') || lower.includes('tapas')) return 'spanish';
  if (lower.includes('ital')) return 'italian';
  if (lower.includes('brit') || lower.includes('pub') || lower.includes('english')) return 'british';
  if (lower.includes('thai')) return 'thai';
  if (lower.includes('indi') || lower.includes('pakis')) return 'indian';
  if (lower.includes('chin') || lower.includes('taiwan') || lower.includes('vietnam')) return 'easian';
  if (lower.includes('turk') || lower.includes('persian') || lower.includes('leban')) return 'mideast';
  if (lower.includes('afric')) return 'african';
  if (lower.includes('seafood') || lower.includes('fish')) return 'seafood';
  if (lower.includes('fren') || lower.includes('europ')) return 'european';
  return 'other';
}

const onSubmit = handleSubmit((formValues) => {
  const tagsArray = formValues.tags
    .split(',')
    .map(t => t.trim().toLowerCase().replace(/^#/, ''))
    .filter(Boolean);

  const placeData: Omit<Place, 'id' | 'dateAdded'> = {
    name: formValues.name,
    cuisine: formValues.cuisine,
    cuisineGroup: mapCuisineToGroup(formValues.cuisine),
    specialty: formValues.specialty || '',
    area: formValues.area,
    address: formValues.address,
    lat: formValues.lat,
    lng: formValues.lng,
    priceLevel: formValues.priceLevel,
    status: formValues.status,
    visits: formValues.status === 'ranked' ? Math.max(1, 1) : 0,
    tags: tagsArray,
    note: formValues.note || '',
    website: formValues.website || null,
    rank: null,
    photo: null
  };

  if (isEditing.value && store.editingPlace) {
    store.updatePlace(store.editingPlace.id, placeData);
    store.clearEditingPlace();
  } else {
    store.addPlace({
      ...placeData,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString()
    } as Place);
  }

  ui.closeModal();
});
</script>

<template>
  <div
    v-if="ui.activeModal === 'addPlace' || ui.activeModal === 'editPlace'"
    ref="modalRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    @keydown.window="onKeyDown"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="ui.activeModal === 'addPlace' ? 'add-place-title' : 'edit-place-title'"
  >
    <div class="relative w-full max-w-md max-h-[90vh] bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 overflow-y-auto scrollbar-thin my-auto animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 :id="isEditing ? 'edit-place-title' : 'add-place-title'" class="font-serif font-bold text-xl text-text-primary">
            {{ isEditing ? 'Edit Place' : 'Add New Place' }}
          </h2>
          <p class="text-xs text-text-tertiary font-medium">
            Add detailed information for your map and ranking
          </p>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-secondary"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="space-y-4">

        <!-- Status Switcher -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-bg-secondary rounded-2xl border border-border text-xs font-semibold" role="group" aria-label="Place status">
          <button
            type="button"
            @click="status = 'want'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="status === 'want' ? 'bg-surface text-highlight shadow-sm' : 'text-text-tertiary'"
            :aria-pressed="status === 'want'"
          >
            <span>★ Want to try</span>
          </button>

          <button
            type="button"
            @click="status = 'ranked'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="status === 'ranked' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-tertiary'"
            :aria-pressed="status === 'ranked'"
          >
            <span>✓ Visited (Rank)</span>
          </button>
        </div>

        <!-- Name & Cuisine -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="place-name" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Restaurant Name *
            </label>
            <input
              id="place-name"
              v-model="name"
              type="text"
              placeholder="e.g. Brat, Padella..."
              aria-required="true"
              :aria-describedby="nameError ? 'place-name-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="nameError ? 'border-danger' : 'border-border'"
            />
            <p v-if="nameError" id="place-name-error" class="text-[11px] text-danger mt-1">{{ nameError }}</p>
          </div>

          <div>
            <label for="place-cuisine" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Cuisine Type *
            </label>
            <input
              id="place-cuisine"
              v-model="cuisine"
              type="text"
              placeholder="e.g. Basque, Italian, Thai..."
              aria-required="true"
              :aria-describedby="cuisineError ? 'place-cuisine-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="cuisineError ? 'border-danger' : 'border-border'"
            />
            <p v-if="cuisineError" id="place-cuisine-error" class="text-[11px] text-danger mt-1">{{ cuisineError }}</p>
          </div>
        </div>

        <!-- Specialty & Area -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="place-specialty" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Specialty / Signature Dish
            </label>
            <input
              id="place-specialty"
              v-model="specialty"
              type="text"
              placeholder="e.g. Wood-grilled fish, Fresh pasta..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          <div>
            <label for="place-area" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Neighborhood or Area *
            </label>
            <input
              id="place-area"
              v-model="area"
              type="text"
              placeholder="e.g. Shoreditch, Soho..."
              aria-required="true"
              :aria-describedby="areaError ? 'place-area-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="areaError ? 'border-danger' : 'border-border'"
            />
            <p v-if="areaError" id="place-area-error" class="text-[11px] text-danger mt-1">{{ areaError }}</p>
          </div>
        </div>

        <!-- Address & Geocoding -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="place-address" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Full Address *
            </label>
            <button
              type="button"
              @click="searchGeocode"
              :disabled="isGeocoding"
              class="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Search class="w-3 h-3" />
              <span>{{ isGeocoding ? 'Searching...' : 'Auto-fetch coordinates' }}</span>
            </button>
          </div>
          <input
            id="place-address"
            v-model="address"
            type="text"
            placeholder="e.g. 4 Redchurch St, London E1 6JL"
            aria-required="true"
            :aria-describedby="addressError ? 'place-address-error' : undefined"
            class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            :class="addressError ? 'border-danger' : 'border-border'"
          />
          <p v-if="addressError" id="place-address-error" class="text-[11px] text-danger mt-1">{{ addressError }}</p>
          <p v-else-if="noGeocodeResults" class="text-[11px] text-danger mt-1" role="status">
            No coordinates found. Try searching only the neighborhood or city, type latitude/longitude below, or place the pin directly on the map.
          </p>

          <button
            type="button"
            @click="ui.startPinPick(isEditing ? 'editPlace' : 'addPlace')"
            class="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-primary/50 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <MapPin class="w-3.5 h-3.5" />
            Place pin directly on the map
          </button>

          <div
            v-if="geocodeResults.length > 0"
            class="mt-2 rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
            role="listbox"
            aria-label="Search results — choose the matching place"
          >
            <button
              v-for="(r, i) in geocodeResults"
              :key="i"
              type="button"
              role="option"
              @click="applyGeocodeResult(r)"
              class="w-full text-left px-3 py-2 text-[11px] text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors border-b border-border last:border-b-0"
            >
              {{ r.display_name }}
            </button>
          </div>
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="place-lat" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Latitude
            </label>
            <input
              id="place-lat"
              v-model.number="lat"
              type="number"
              step="any"
              :aria-describedby="latError ? 'place-lat-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="latError ? 'border-danger' : 'border-border'"
            />
            <p v-if="latError" id="place-lat-error" class="text-[11px] text-danger mt-1">{{ latError }}</p>
          </div>

          <div>
            <label for="place-lng" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Longitude
            </label>
            <input
              id="place-lng"
              v-model.number="lng"
              type="number"
              step="any"
              :aria-describedby="lngError ? 'place-lng-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="lngError ? 'border-danger' : 'border-border'"
            />
            <p v-if="lngError" id="place-lng-error" class="text-[11px] text-danger mt-1">{{ lngError }}</p>
          </div>
        </div>

        <!-- Price Level -->
        <div role="radiogroup" aria-label="Price range">
          <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
            Price Range
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="level in [1, 2, 3, 4]"
              :key="level"
              type="button"
              role="radio"
              :aria-checked="priceLevel === level"
              :aria-label="`${'£'.repeat(level)} price level`"
              @click="priceLevel = level as 1 | 2 | 3 | 4"
              class="py-2 rounded-xl text-xs font-semibold border transition-all"
              :class="priceLevel === level ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-bg-secondary text-text-tertiary'"
            >
              {{ '£'.repeat(level) }}
            </button>
          </div>
        </div>

        <!-- Personal Note -->
        <div>
          <label for="place-note" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            Personal Note or Review
          </label>
          <textarea
            id="place-note"
            v-model="note"
            rows="2"
            placeholder="What did you order? Any recommendations for dishes or reservations?"
            class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
          ></textarea>
        </div>

        <!-- Tags & Website -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="place-tags" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Tags (comma separated)
            </label>
            <input
              id="place-tags"
              v-model="tags"
              type="text"
              placeholder="e.g. date-night, pasta, walk-ins"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          <div>
            <label for="place-website" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Website (Optional)
            </label>
            <input
              id="place-website"
              v-model="website"
              type="url"
              placeholder="https://..."
              :aria-describedby="websiteError ? 'place-website-error' : undefined"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="websiteError ? 'border-danger' : 'border-border'"
            />
            <p v-if="websiteError" id="place-website-error" class="text-[11px] text-danger mt-1">{{ websiteError }}</p>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="pt-3 border-t border-border flex items-center justify-end gap-2">
          <button
            type="button"
            @click="ui.closeModal()"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary text-text-secondary hover:bg-bg-tertiary transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary shadow-sm transition-all"
          >
            {{ isEditing ? 'Save Changes' : 'Add Place' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>
