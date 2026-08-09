<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { X, Trophy, Plus, MapPin, Globe, ExternalLink, Edit3, Trash2, CheckCircle2, Share2 } from '@lucide/vue';
import { useConfetti } from '../composables/useConfetti';

const store = usePlacesStore();
const ui = useUIStore();
const { fireConfetti, fireTopPickConfetti } = useConfetti();

const place = computed(() => store.selectedPlace);

const isVisible = computed(() => ui.showDetailSheet && place.value);

function shareThisPlace() {
  if (place.value) {
    store.selectedPlaceId = place.value.id;
    ui.openModal('share');
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getCuisineColor(group: string) {
  const map: Record<string, string> = {
    british: '#1d4ed8',
    spanish: '#dc2626',
    italian: '#16a34a',
    european: '#7c3aed',
    thai: '#ea580c',
    indian: '#ca8a04',
    easian: '#0891b2',
    mideast: '#9333ea',
    african: '#059669',
    seafood: '#0284c7'
  };
  return map[group] || '#6b7280';
}

function incrementVisit() {
  if (place.value) {
    store.updatePlace(place.value.id, { visits: place.value.visits + 1 });
  }
}

function markAsVisited() {
  if (place.value) {
    const wasWant = place.value.status === 'want';
    store.togglePlaceStatus(place.value.id, () => ui.openModal('duel'));
    if (wasWant) {
      fireConfetti();
      const updatedPlace = store.places.find(p => p.id === place.value?.id);
      if (updatedPlace?.rank === 1) {
        setTimeout(() => fireTopPickConfetti(), 500);
      }
    }
  }
}

function openEdit() {
  if (place.value) {
    store.startEditingPlace(place.value);
    ui.openModal('editPlace');
  }
}

function confirmDelete() {
  if (place.value && confirm(`Are you sure you want to delete "${place.value.name}"?`)) {
    store.removePlace(place.value.id);
    ui.closeDetailSheet();
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

<template>
  <Transition name="slide-fade">
    <div
      v-if="isVisible"
      class="fixed inset-y-0 right-0 z-40 w-full sm:w-90 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden"
    >
      <!-- Header Bar -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center gap-2">
          <span
            v-if="place.status === 'ranked' && place.rank !== null"
            class="px-2.5 py-1 rounded-full text-xs font-serif font-bold bg-emerald-600 text-white shadow-sm"
          >
            Rank #{{ place.rank }}
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
          >
            Want to Try
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Added: {{ formatDate(place.dateAdded) }}
          </span>
        </div>

        <button
          @click="ui.closeDetailSheet()"
          class="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">

        <!-- Main Title & Specialty -->
        <div>
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-serif font-bold text-2xl text-gray-900 dark:text-gray-100 leading-tight">
              {{ place.name }}
            </h2>
            <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
              {{ '£'.repeat(place.priceLevel || 1) }}
            </span>
          </div>

          <p v-if="place.specialty" class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {{ place.specialty }}
          </p>

          <div class="flex items-center gap-2 mt-2">
            <span
              class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              :style="{ backgroundColor: getCuisineColor(place.cuisineGroup) }"
            >
              {{ place.cuisine }}
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">
              📍 {{ place.area }}
            </span>
          </div>
        </div>

        <!-- Primary Ranking CTA -->
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Current Status: <strong class="text-gray-900 dark:text-gray-100">{{ place.status === 'ranked' ? 'Visited' : 'Pending' }}</strong></span>
            <span v-if="place.status === 'ranked'">{{ place.visits }} {{ place.visits === 1 ? 'visit' : 'visits' }}</span>
          </div>

          <!-- If Want: Mark as Been & Rank -->
          <button
            v-if="place.status === 'want'"
            @click="markAsVisited"
            class="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>I've been here! Rank now</span>
          </button>

          <!-- If Ranked: Re-rank or Add Visit -->
          <div v-else class="flex gap-2">
            <button
              @click="store.startDuel(place.id)"
              class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <Trophy class="w-3.5 h-3.5" />
              <span>Change Rank</span>
            </button>

            <button
              @click="incrementVisit"
              class="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+1 Visit</span>
            </button>
          </div>
        </div>

        <!-- Personal Note -->
        <div v-if="place.note" class="space-y-1.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Personal Note
          </h4>
          <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-l-4 border-emerald-600 text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
            "{{ place.note }}"
          </div>
        </div>

        <!-- Address & Map Info -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Location & Address
          </h4>
          <p class="text-xs text-gray-900 dark:text-gray-100 flex items-start gap-1.5 leading-relaxed">
            <MapPin class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{{ place.address }}</span>
          </p>
        </div>

        <!-- Official Website Link -->
        <div v-if="place.website" class="pt-1">
          <a
            :href="place.website"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-emerald-500 transition-all"
          >
            <Globe class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Visit official website</span>
            <ExternalLink class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </a>
        </div>

        <!-- Tags -->
        <div v-if="place.tags && place.tags.length > 0" class="space-y-1.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Tags
          </h4>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in place.tags"
              :key="tag"
              class="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
        <button
          @click="shareThisPlace"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span>Card / Share</span>
        </button>

        <div class="flex items-center gap-1.5">
          <button
            @click="openEdit"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            @click="confirmDelete"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

    </div>
  </Transition>
</template>
