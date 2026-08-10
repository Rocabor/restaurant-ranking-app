 <!--* app\components\PlaceFormModal.vue  -->

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '../types';
import { X, Search } from '@lucide/vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { placeFormSchema } from '~/utils/schemas';

const store = usePlacesStore();
const ui = useUIStore();

const isEditing = computed(() => ui.activeModal === 'editPlace');

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
  } else if (val === 'addPlace') {
    resetForm();
  }
});

async function searchGeocode() {
  if (!address.value && !name.value) return;
  isGeocoding.value = true;

  const query = `${name.value || ''} ${address.value || ''} ${area.value || ''}`;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data && data.length > 0) {
      setValues({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name.split(',').slice(0, 3).join(','),
      });
    } else {
      alert('No coordinates found for that address. You can enter them manually.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    isGeocoding.value = false;
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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
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
        <div class="grid grid-cols-2 gap-2 p-1 bg-bg-secondary rounded-2xl border border-border text-xs font-semibold">
          <button
            type="button"
            @click="status = 'want'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="status === 'want' ? 'bg-surface text-highlight shadow-sm' : 'text-text-tertiary'"
          >
            <span>★ Want to try</span>
          </button>

          <button
            type="button"
            @click="status = 'ranked'"
            class="py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
            :class="status === 'ranked' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-tertiary'"
          >
            <span>✓ Visited (Rank)</span>
          </button>
        </div>

        <!-- Name & Cuisine -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Restaurant Name *
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="e.g. Brat, Padella..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="nameError ? 'border-danger' : 'border-border'"
            />
            <p v-if="nameError" class="text-[11px] text-danger mt-1">{{ nameError }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Cuisine Type *
            </label>
            <input
              v-model="cuisine"
              type="text"
              placeholder="e.g. Basque, Italian, Thai..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="cuisineError ? 'border-danger' : 'border-border'"
            />
            <p v-if="cuisineError" class="text-[11px] text-danger mt-1">{{ cuisineError }}</p>
          </div>
        </div>

        <!-- Specialty & Area -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Specialty / Signature Dish
            </label>
            <input
              v-model="specialty"
              type="text"
              placeholder="e.g. Wood-grilled fish, Fresh pasta..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Neighborhood or Area *
            </label>
            <input
              v-model="area"
              type="text"
              placeholder="e.g. Shoreditch, Soho..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="areaError ? 'border-danger' : 'border-border'"
            />
            <p v-if="areaError" class="text-[11px] text-danger mt-1">{{ areaError }}</p>
          </div>
        </div>

        <!-- Address & Geocoding -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary">
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
            v-model="address"
            type="text"
            placeholder="e.g. 4 Redchurch St, London E1 6JL"
            class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            :class="addressError ? 'border-danger' : 'border-border'"
          />
          <p v-if="addressError" class="text-[11px] text-danger mt-1">{{ addressError }}</p>
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Latitude
            </label>
            <input
              v-model.number="lat"
              type="number"
              step="any"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="latError ? 'border-danger' : 'border-border'"
            />
            <p v-if="latError" class="text-[11px] text-danger mt-1">{{ latError }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Longitude
            </label>
            <input
              v-model.number="lng"
              type="number"
              step="any"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="lngError ? 'border-danger' : 'border-border'"
            />
            <p v-if="lngError" class="text-[11px] text-danger mt-1">{{ lngError }}</p>
          </div>
        </div>

        <!-- Price Level -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
            Price Range
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="level in [1, 2, 3, 4]"
              :key="level"
              type="button"
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
          <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            Personal Note or Review
          </label>
          <textarea
            v-model="note"
            rows="2"
            placeholder="What did you order? Any recommendations for dishes or reservations?"
            class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
          ></textarea>
        </div>

        <!-- Tags & Website -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Tags (comma separated)
            </label>
            <input
              v-model="tags"
              type="text"
              placeholder="e.g. date-night, pasta, walk-ins"
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              Website (Optional)
            </label>
            <input
              v-model="website"
              type="url"
              placeholder="https://..."
              class="w-full px-3.5 py-2 text-xs bg-bg-secondary border rounded-xl focus:outline-none focus:border-primary text-text-primary"
              :class="websiteError ? 'border-danger' : 'border-border'"
            />
            <p v-if="websiteError" class="text-[11px] text-danger mt-1">{{ websiteError }}</p>
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
