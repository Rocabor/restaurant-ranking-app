 <!--* app\components\PlaceFormModal.vue  -->

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '../types';
import { X, Search } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();

const isEditing = computed(() => ui.activeModal === 'editPlace');

const form = ref<Partial<Place>>({
  name: '',
  cuisine: '',
  cuisineGroup: 'other',
  specialty: '',
  area: '',
  address: '',
  lat: 51.5155,
  lng: -0.098,
  priceLevel: 2,
  status: 'want',
  visits: 0,
  tags: [],
  note: '',
  website: null
});

const tagsInput = ref('');
const isGeocoding = ref(false);

watch(() => ui.activeModal, (val) => {
  if (val === 'editPlace' && store.editingPlace) {
    form.value = { ...store.editingPlace };
    tagsInput.value = (store.editingPlace.tags || []).join(', ');
  } else if (val === 'addPlace') {
    form.value = {
      name: '',
      cuisine: '',
      cuisineGroup: 'other',
      specialty: '',
      area: '',
      address: '',
      lat: 51.5155,
      lng: -0.098,
      priceLevel: 2,
      status: 'want',
      visits: 0,
      tags: [],
      note: '',
      website: null
    };
    tagsInput.value = '';
  }
});

async function searchGeocode() {
  if (!form.value.address && !form.value.name) return;
  isGeocoding.value = true;

  const query = `${form.value.name || ''} ${form.value.address || ''} ${form.value.area || ''}`;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data && data.length > 0) {
      form.value.lat = parseFloat(data[0].lat);
      form.value.lng = parseFloat(data[0].lon);
      if (data[0].display_name) {
        form.value.address = data[0].display_name.split(',').slice(0, 3).join(',');
      }
    } else {
      alert('No coordinates found for that address. You can enter them manually.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    isGeocoding.value = false;
  }
}

function onSubmit() {
  const tagsArray = tagsInput.value
    .split(',')
    .map(t => t.trim().toLowerCase().replace(/^#/, ''))
    .filter(Boolean);

  const placeData: Omit<Place, 'id' | 'dateAdded'> = {
    name: form.value.name || 'Unnamed',
    cuisine: form.value.cuisine || 'General',
    cuisineGroup: mapCuisineToGroup(form.value.cuisine || ''),
    specialty: form.value.specialty || '',
    area: form.value.area || 'Downtown',
    address: form.value.address || '',
    lat: form.value.lat || 51.5155,
    lng: form.value.lng || -0.098,
    priceLevel: form.value.priceLevel || 2,
    status: form.value.status || 'want',
    visits: form.value.status === 'ranked' ? Math.max(1, form.value.visits || 1) : 0,
    tags: tagsArray,
    note: form.value.note || '',
    website: form.value.website || null,
    rank: form.value.rank || null,
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
</script>

<template>
  <div
    v-if="ui.activeModal === 'addPlace' || ui.activeModal === 'editPlace'"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="ui.activeModal === 'addPlace' ? 'add-place-title' : 'edit-place-title'"
  >
    <div class="relative w-full max-w-md max-h-[90vh] bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 overflow-y-auto scrollbar-thin my-auto animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 :id="isEditing ? 'edit-place-title' : 'add-place-title'" class="font-serif font-bold text-xl text-gray-900 dark:text-gray-100">
            {{ isEditing ? 'Edit Place' : 'Add New Place' }}
          </h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Add detailed information for your map and ranking
          </p>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="space-y-4">

        <!-- Status Switcher -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
          <button
            type="button"
            @click="form.status = 'want'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="form.status === 'want' ? 'bg-white dark:bg-gray-900 text-highlight dark:text-highlight-strong shadow-sm' : 'text-gray-400'"
          >
            <span>★ Want to try</span>
          </button>

          <button
            type="button"
            @click="form.status = 'ranked'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="form.status === 'ranked' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400'"
          >
            <span>✓ Visited (Rank)</span>
          </button>
        </div>

        <!-- Name & Cuisine -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Restaurant Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Brat, Padella..."
              required
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Cuisine Type *
            </label>
            <input
              v-model="form.cuisine"
              type="text"
              placeholder="e.g. Basque, Italian, Thai..."
              required
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <!-- Specialty & Area -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Specialty / Signature Dish
            </label>
            <input
              v-model="form.specialty"
              type="text"
              placeholder="e.g. Wood-grilled fish, Fresh pasta..."
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Neighborhood or Area *
            </label>
            <input
              v-model="form.area"
              type="text"
              placeholder="e.g. Shoreditch, Soho..."
              required
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <!-- Address & Geocoding -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Full Address *
            </label>
            <button
              type="button"
              @click="searchGeocode"
              :disabled="isGeocoding"
              class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Search class="w-3 h-3" />
              <span>{{ isGeocoding ? 'Searching...' : 'Auto-fetch coordinates' }}</span>
            </button>
          </div>
          <input
            v-model="form.address"
            type="text"
            placeholder="e.g. 4 Redchurch St, London E1 6JL"
            required
            class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
          />
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Latitude
            </label>
            <input
              v-model.number="form.lat"
              type="number"
              step="any"
              required
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Longitude
            </label>
            <input
              v-model.number="form.lng"
              type="number"
              step="any"
              required
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <!-- Price Level -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Price Range
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="level in [1, 2, 3, 4]"
              :key="level"
              type="button"
              @click="form.priceLevel = level"
              class="py-2 rounded-xl text-xs font-semibold border transition-all"
              :class="form.priceLevel === level ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'"
            >
              {{ '£'.repeat(level) }}
            </button>
          </div>
        </div>

        <!-- Personal Note -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Personal Note or Review
          </label>
          <textarea
            v-model="form.note"
            rows="2"
            placeholder="What did you order? Any recommendations for dishes or reservations?"
            class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
          ></textarea>
        </div>

        <!-- Tags & Website -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Tags (comma separated)
            </label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="e.g. date-night, pasta, walk-ins"
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Website (Optional)
            </label>
            <input
              v-model="form.website"
              type="url"
              placeholder="https://..."
              class="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="ui.closeModal()"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            {{ isEditing ? 'Save Changes' : 'Add Place' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>
