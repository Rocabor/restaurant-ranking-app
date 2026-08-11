<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { X, Trophy, Plus, MapPin, Globe, ExternalLink, Edit3, Trash2, CheckCircle2 } from '@lucide/vue';
import { useFocusTrap } from '../composables/useFocusTrap';

const store = usePlacesStore();
const ui = useUIStore();

const sheetRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(sheetRef);

const place = computed(() => store.selectedPlace);

const isVisible = computed(() => ui.showDetailSheet && place.value);

watch(isVisible, (visible) => {
  if (visible) {
    activate();
  } else {
    deactivate();
  }
});

function onKeyDown(e: KeyboardEvent) {
  if (!isVisible.value) return;
  if (e.key === 'Escape') {
    ui.closeDetailSheet();
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
    store.togglePlaceStatus(place.value.id, () => ui.openModal('duel'));
  }
}

function openEdit() {
  if (place.value) {
    store.startEditingPlace(place.value);
    ui.openModal('editPlace');
  }
}

function confirmDelete() {
  if (place.value) {
    ui.showConfirm({
      title: 'Delete place',
      message: `Are you sure you want to delete "${place.value.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        store.removePlace(place.value!.id);
        ui.closeDetailSheet();
      },
    });
  }
}
</script>

<style scoped>
/* Mobile: full-width overlay that slides from right */
.detail-panel {
  position: fixed;
  inset: 0;
  width: 100%;
  z-index: 40;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}
.detail-panel.is-open {
  transform: translateX(0);
}
/* Tablet & Desktop: fixed right-side panel */
@media (min-width: 768px) {
  .detail-panel {
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: 24rem;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
  }
  .detail-panel.is-open {
    transform: translateX(0);
  }
}
</style>

<template>
  <div
    v-if="isVisible && place"
    ref="sheetRef"
    class="detail-panel shrink-0 bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden h-full"
    :class="{ 'is-open': isVisible }"
    role="dialog"
    aria-modal="true"
    :aria-label="place ? `Details for ${place.name}` : 'Place details'"
  >
      <!-- Header Bar -->
      <div class="p-4 border-b border-border flex items-center justify-between bg-bg-secondary">
        <div class="flex items-center gap-2">
          <span
            v-if="place.status === 'ranked' && place.rank !== null"
            class="px-2.5 py-1 rounded-full text-xs font-serif font-bold bg-primary text-on-primary shadow-sm"
          >
            Rank #{{ place.rank }}
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-highlight/10 text-highlight-strong border border-highlight/30"
          >
            Want to Try
          </span>
          <span class="text-xs text-text-tertiary font-medium">
            Added: {{ formatDate(place.dateAdded) }}
          </span>
        </div>

        <button
          @click="ui.closeDetailSheet()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">

        <!-- Main Title & Specialty -->
        <div>
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-serif font-bold text-2xl text-text-primary leading-tight">
              {{ place.name }}
            </h2>
            <span class="text-base font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {{ '£'.repeat(place.priceLevel || 1) }}
            </span>
          </div>

          <p v-if="place.specialty" class="text-sm font-medium text-text-secondary mt-1">
            {{ place.specialty }}
          </p>

          <div class="flex items-center gap-2 mt-2">
            <span
              class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              :style="{ backgroundColor: getCuisineColor(place.cuisineGroup) }"
            >
              {{ place.cuisine }}
            </span>
            <span class="text-xs text-text-tertiary font-medium">
              📍 {{ place.area }}
            </span>
          </div>
        </div>

        <!-- Primary Ranking CTA -->
        <div class="bg-bg-secondary border border-border rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Current Status: <strong class="text-text-primary">{{ place.status === 'ranked' ? 'Visited' : 'Pending' }}</strong></span>
            <span v-if="place.status === 'ranked'">{{ place.visits }} {{ place.visits === 1 ? 'visit' : 'visits' }}</span>
          </div>

          <!-- If Want: Mark as Been & Rank -->
          <button
            v-if="place.status === 'want'"
            @click="markAsVisited"
            class="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>I've been here! Rank now</span>
          </button>

          <!-- If Ranked: Re-rank or Add Visit -->
          <div v-else class="flex gap-2">
            <button
              @click="store.startBinaryInsertion(place.id); ui.openModal('duel')"
              class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5"
            >
              <Trophy class="w-3.5 h-3.5" />
              <span>Change Rank</span>
            </button>

            <button
              @click="incrementVisit"
              class="py-2 px-3 rounded-xl text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-bg-secondary transition-all flex items-center justify-center gap-1"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+1 Visit</span>
            </button>
          </div>
        </div>

        <!-- Personal Note -->
        <div v-if="place.note" class="space-y-1.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Personal Note
          </h3>
          <div class="p-3.5 rounded-xl bg-bg-secondary border-l-4 border-primary text-xs text-text-secondary italic leading-relaxed">
            "{{ place.note }}"
          </div>
        </div>

        <!-- Address & Map Info -->
        <div class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Location & Address
          </h3>
          <p class="text-xs text-text-primary flex items-start gap-1.5 leading-relaxed">
            <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{{ place.address }}</span>
          </p>
        </div>

        <!-- Official Website Link -->
        <div v-if="place.website" class="pt-1">
          <a
            :href="place.website"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary border border-border text-text-primary hover:border-primary transition-all"
          >
            <Globe class="w-4 h-4 text-primary" />
            <span>Visit official website</span>
            <ExternalLink class="w-3.5 h-3.5 text-text-tertiary" />
          </a>
        </div>

        <!-- Tags -->
        <div v-if="place.tags && place.tags.length > 0" class="space-y-1.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Tags
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in place.tags"
              :key="tag"
              class="text-xs px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary font-medium border border-border"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t border-border bg-bg-secondary flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <button
            @click="openEdit"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-bg-secondary transition-all"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            @click="confirmDelete"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger/10 transition-all"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

    </div>
</template>
