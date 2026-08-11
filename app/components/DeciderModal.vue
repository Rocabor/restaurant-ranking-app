<!--* app/components/DeciderModal.vue -->

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '~/types';
import { Sparkles, X, Dices, MapPin, RotateCw } from '@lucide/vue';
import { useFocusTrap } from '../composables/useFocusTrap';

const store = usePlacesStore();
const ui = useUIStore();

const isOpen = computed(() => ui.activeModal === 'decider');

const mood = ref<'ranked' | 'want' | 'any'>('any');
const maxPrice = ref<number | null>(null);
const recommendation = ref<Place | null>(null);

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

function generateRecommendation() {
  let candidates = store.places;

  if (mood.value === 'ranked') {
    candidates = store.rankedPlaces;
  } else if (mood.value === 'want') {
    candidates = store.wantToTry;
  }

  if (maxPrice.value !== null) {
    candidates = candidates.filter(p => p.priceLevel <= maxPrice.value!);
  }

  if (candidates.length === 0) {
    candidates = store.places;
  }

  const randomIdx = Math.floor(Math.random() * candidates.length);
  recommendation.value = candidates[randomIdx] || null;
}

function goToRecommendation() {
  if (recommendation.value) {
    store.selectPlace(recommendation.value.id);
    ui.closeModal();
    recommendation.value = null;
  }
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'decider'"
    ref="modalRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @keydown.window="onKeyDown"
    role="dialog"
    aria-modal="true"
    aria-labelledby="decider-title"
  >
    <div class="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">

      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-highlight/20 text-highlight-strong">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h2 id="decider-title" class="font-serif font-bold text-xl text-text-primary">
              Where to Eat Today?
            </h2>
            <p class="text-xs text-text-tertiary font-medium">
              Your smart assistant to make quick dining decisions
            </p>
          </div>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Filters Form if No Recommendation Yet -->
      <div v-if="!recommendation" class="space-y-4">

        <!-- Mood Selector -->
        <div>
          <label id="decider-mood-label" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
            What are you in the mood for?
          </label>
          <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="decider-mood-label">
            <button
              @click="mood = 'ranked'"
              role="radio"
              :aria-checked="mood === 'ranked'"
              class="p-3 rounded-2xl border text-left transition-all"
              :class="mood === 'ranked' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-bg-secondary text-text-secondary'"
            >
              <div class="text-xs">🏆 Proven Favorite</div>
              <div class="text-[10px] opacity-75 mt-0.5">My top ranks</div>
            </button>

            <button
              @click="mood = 'want'"
              role="radio"
              :aria-checked="mood === 'want'"
              class="p-3 rounded-2xl border text-left transition-all"
              :class="mood === 'want' ? 'border-highlight-strong bg-highlight/20 text-highlight-strong font-bold' : 'border-border bg-bg-secondary text-text-secondary'"
            >
              <div class="text-xs">✨ Something New</div>
              <div class="text-[10px] opacity-75 mt-0.5">To-Try List</div>
            </button>

            <button
              @click="mood = 'any'"
              role="radio"
              :aria-checked="mood === 'any'"
              class="p-3 rounded-2xl border text-left transition-all"
              :class="mood === 'any' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-bg-secondary text-text-secondary'"
            >
              <div class="text-xs">🎲 Surprise Me</div>
              <div class="text-[10px] opacity-75 mt-0.5">Any option</div>
            </button>
          </div>
        </div>

        <!-- Optional Price Limit -->
        <div>
          <label id="decider-price-label" class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
            Maximum budget
          </label>
          <div class="flex gap-2" role="radiogroup" aria-labelledby="decider-price-label">
            <button
              @click="maxPrice = null"
              role="radio"
              :aria-checked="maxPrice === null"
              class="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
              :class="maxPrice === null ? 'border-primary bg-primary text-on-primary' : 'border-border bg-bg-secondary text-text-secondary'"
            >
              Any
            </button>

            <button
              v-for="price in [1, 2, 3, 4]"
              :key="price"
              @click="maxPrice = price"
              role="radio"
              :aria-checked="maxPrice === price"
              :aria-label="`${'£'.repeat(price)} maximum`"
              class="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
              :class="maxPrice === price ? 'border-primary bg-primary text-on-primary' : 'border-border bg-bg-secondary text-text-secondary'"
            >
              {{ '£'.repeat(price) }}
            </button>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          @click="generateRecommendation"
          class="w-full py-3 rounded-2xl text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
        >
          <Dices class="w-4 h-4" />
          <span>Pick a place for me!</span>
        </button>

      </div>

      <!-- Recommendation Result Card -->
      <div v-else class="space-y-4 animate-fade-in" aria-live="polite">
        <div class="p-5 rounded-2xl bg-bg-secondary border-2 border-primary space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-on-primary">
              Your Perfect Choice
            </span>
            <span class="text-xs font-bold text-primary">
              {{ '£'.repeat(recommendation.priceLevel || 1) }}
            </span>
          </div>

          <div>
            <h3 class="font-serif font-bold text-2xl text-text-primary">
              {{ recommendation.name }}
            </h3>
            <p v-if="recommendation.specialty" class="text-xs font-medium text-text-secondary mt-0.5">
              {{ recommendation.specialty }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs text-text-tertiary">
            <span>📍 {{ recommendation.area }}</span>
            <span>• {{ recommendation.cuisine }}</span>
            <span v-if="recommendation.rank" class="font-bold text-primary">• Rank #{{ recommendation.rank }}</span>
          </div>

          <p v-if="recommendation.note" class="text-xs text-text-secondary italic bg-surface p-3 rounded-xl border border-border">
            "{{ recommendation.note }}"
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="goToRecommendation"
            class="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin class="w-4 h-4" />
            <span>View on map and go</span>
          </button>

          <button
            @click="generateRecommendation"
            class="py-2.5 px-4 rounded-xl text-xs font-semibold bg-bg-secondary border border-border text-text-primary hover:bg-bg-tertiary transition-all flex items-center gap-1"
          >
            <RotateCw class="w-3.5 h-3.5" />
            <span>Another option</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
