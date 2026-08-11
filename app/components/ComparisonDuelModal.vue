<!--* app\components\ComparisonDuelModal.vue  -->

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { Trophy, Scale, CheckCircle2, X } from '@lucide/vue';
import { useFocusTrap } from '../composables/useFocusTrap';

const store = usePlacesStore();
const ui = useUIStore();

const modalRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(modalRef);

const isOpen = computed(() => ui.activeModal === 'duel');

watch(isOpen, (open) => {
  if (open) {
    activate();
  } else {
    deactivate();
  }
});

const newPlace = computed(() => {
  if (!store.binaryInsertion.newPlaceId) return null;
  return store.places.find(p => p.id === store.binaryInsertion.newPlaceId) || null;
});

const currentOpponent = computed(() => {
  if (!store.binaryInsertion.currentOpponentId) return null;
  return store.places.find(p => p.id === store.binaryInsertion.currentOpponentId) || null;
});

const progress = computed(() => {
  const { questionCount, totalEstimate } = store.binaryInsertion;
  if (totalEstimate === 0) return 0;
  return Math.min(100, Math.round((questionCount / totalEstimate) * 100));
});

const placedResult = ref<string | null>(null);

watch(isOpen, (open) => {
  if (open) {
    placedResult.value = null;
    activate();
  } else {
    deactivate();
  }
});

function onKeyDown(e: KeyboardEvent) {
  if (ui.activeModal !== 'duel') return;
  if (!store.binaryInsertion.isPlacing) return;

  if (e.key === '1' || e.key === 'ArrowLeft') {
    e.preventDefault();
    handleChoice('new');
  } else if (e.key === '2' || e.key === 'ArrowRight') {
    e.preventDefault();
    handleChoice('existing');
  } else if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    handleChoice('tie');
  } else if (e.key === 'Escape') {
    ui.closeModal();
  }
}

function handleChoice(choice: 'new' | 'existing' | 'tie') {
  const placingId = store.binaryInsertion.newPlaceId;
  store.handleBinaryInsertionChoice(choice);
  if (!store.binaryInsertion.isPlacing) {
    const placed = placingId ? store.places.find(p => p.id === placingId) : null;
    if (placed) {
      placedResult.value = `${placed.name} placed at number ${placed.rank} in your ranking.`;
    }
    setTimeout(() => {
      ui.closeModal();
    }, 1500);
  }
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'duel'"
    ref="modalRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @keydown.window="onKeyDown"
    role="dialog"
    aria-modal="true"
    aria-labelledby="duel-title"
  >
    <div class="relative w-full max-w-2xl max-h-[92vh] bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 overflow-y-auto scrollbar-thin my-auto animate-fade-in">

      <button
        @click="ui.closeModal()"
        class="absolute top-4 right-4 p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      <template v-if="store.binaryInsertion.isPlacing && newPlace && currentOpponent">

      <!-- Modal Header & Progress -->
      <div class="space-y-2 text-center">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <Trophy class="w-4 h-4" />
          <span>Ranking • Binary Insertion</span>
        </div>

        <h2 id="duel-title" class="font-serif font-bold text-2xl text-text-primary">
          Which one do you prefer?
        </h2>
        <p class="text-xs text-text-secondary font-medium" aria-live="polite">
          Question {{ store.binaryInsertion.questionCount }} of ~{{ store.binaryInsertion.totalEstimate }}
        </p>

        <!-- Progress Bar -->
        <div class="w-full max-w-xs mx-auto space-y-1 pt-1">
          <div class="w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden border border-border">
            <div
              class="bg-primary h-full transition-all duration-300 rounded-full"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-text-secondary font-medium">
            {{ progress }}% complete
          </p>
        </div>
      </div>

      <!-- Duel Options Comparison Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

        <!-- NEW PLACE (Option A) -->
        <button
          type="button"
          @click="handleChoice('new')"
          :aria-label="`Select ${newPlace.name} as better than ${currentOpponent.name}`"
          class="group relative bg-bg-secondary border-2 border-border hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4 cursor-pointer"
        >
          <div class="space-y-3">

            <!-- Badges Bar -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary text-on-primary shadow-xs">
                New Place
              </span>

              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-highlight/10 text-highlight-strong border border-highlight/30">
                  ★ Want to try
                </span>
                <span class="text-xs font-bold text-primary">
                  {{ '£'.repeat(newPlace.priceLevel || 1) }}
                </span>
              </div>
            </div>

            <!-- Title & Basic Details -->
            <div>
              <span class="block font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors leading-tight">
                {{ newPlace.name }}
              </span>
              <p class="text-xs font-semibold text-primary mt-0.5">
                🍽️ {{ newPlace.cuisine }}
              </p>
              <p class="text-xs text-text-secondary font-medium">
                📍 {{ newPlace.area }} {{ newPlace.address ? `— ${newPlace.address}` : '' }}
              </p>
            </div>

            <!-- Signature Dish -->
            <div v-if="newPlace.specialty" class="p-2.5 rounded-xl bg-surface border border-border space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                ⭐ Signature Dish
              </span>
              <p class="text-xs font-medium text-text-secondary italic">
                "{{ newPlace.specialty }}"
              </p>
            </div>

            <!-- Review / Note -->
            <div v-if="newPlace.note" class="p-2.5 rounded-xl bg-surface/60 border border-border space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                📝 Review / Note
              </span>
              <p class="text-xs text-text-secondary leading-relaxed italic line-clamp-3">
                "{{ newPlace.note }}"
              </p>
            </div>

            <!-- Visits & Tags -->
            <div class="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
              <span v-if="newPlace.visits" class="font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-border">
                👥 {{ newPlace.visits }} {{ newPlace.visits === 1 ? 'visit' : 'visits' }}
              </span>

              <template v-if="newPlace.tags && newPlace.tags.length">
                <span v-for="t in newPlace.tags.slice(0, 3)" :key="t" class="px-1.5 py-0.5 rounded bg-surface text-[10px] border border-border">
                  #{{ t }}
                </span>
              </template>
            </div>

          </div>

          <span
            class="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-primary text-on-primary group-hover:bg-primary-hover transition-all shadow-md active:scale-95 mt-auto flex items-center justify-center gap-2"
          >
            <span>{{ newPlace.name }} is better</span>
            <CheckCircle2 class="w-4 h-4" />
          </span>
        </button>

        <!-- EXISTING PLACE (Option B) -->
        <button
          type="button"
          @click="handleChoice('existing')"
          :aria-label="`Select ${currentOpponent.name} as better than ${newPlace.name}`"
          class="group relative bg-bg-secondary border-2 border-border hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4 cursor-pointer"
        >
          <div class="space-y-3">

            <!-- Badges Bar -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-bg-tertiary text-text-secondary shadow-xs">
                Current #{{ currentOpponent.rank || '?' }}
              </span>

              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                  :class="currentOpponent.status === 'ranked' ? 'bg-primary/10 text-primary' : 'bg-highlight/10 text-highlight-strong border border-highlight/30'"
                >
                  {{ currentOpponent.status === 'ranked' ? `Rank #${currentOpponent.rank || '?'}` : '★ Want to try' }}
                </span>
                <span class="text-xs font-bold text-primary">
                  {{ '£'.repeat(currentOpponent.priceLevel || 1) }}
                </span>
              </div>
            </div>

            <!-- Title & Basic Details -->
            <div>
              <span class="block font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors leading-tight">
                {{ currentOpponent.name }}
              </span>
              <p class="text-xs font-semibold text-primary mt-0.5">
                🍽️ {{ currentOpponent.cuisine }}
              </p>
              <p class="text-xs text-text-secondary font-medium">
                📍 {{ currentOpponent.area }} {{ currentOpponent.address ? `— ${currentOpponent.address}` : '' }}
              </p>
            </div>

            <!-- Signature Dish -->
            <div v-if="currentOpponent.specialty" class="p-2.5 rounded-xl bg-surface border border-border space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                ⭐ Signature Dish
              </span>
              <p class="text-xs font-medium text-text-secondary italic">
                "{{ currentOpponent.specialty }}"
              </p>
            </div>

            <!-- Review / Note -->
            <div v-if="currentOpponent.note" class="p-2.5 rounded-xl bg-surface/60 border border-border space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                📝 Review / Note
              </span>
              <p class="text-xs text-text-secondary leading-relaxed italic line-clamp-3">
                "{{ currentOpponent.note }}"
              </p>
            </div>

            <!-- Visits & Tags -->
            <div class="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
              <span v-if="currentOpponent.visits" class="font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-border">
                👥 {{ currentOpponent.visits }} {{ currentOpponent.visits === 1 ? 'visit' : 'visits' }}
              </span>

              <template v-if="currentOpponent.tags && currentOpponent.tags.length">
                <span v-for="t in currentOpponent.tags.slice(0, 3)" :key="t" class="px-1.5 py-0.5 rounded bg-surface text-[10px] border border-border">
                  #{{ t }}
                </span>
              </template>
            </div>

          </div>

          <span
            class="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-surface border border-border text-text-primary group-hover:border-primary group-hover:text-primary transition-all shadow-md active:scale-95 mt-auto flex items-center justify-center gap-2"
          >
            <span>{{ currentOpponent.name }} is better</span>
            <CheckCircle2 class="w-4 h-4" />
          </span>
        </button>

      </div>

      <!-- Tie & Cancel Controls -->
      <div class="flex items-center justify-between pt-3 border-t border-border text-xs">
        <button
          @click="handleChoice('tie')"
          class="px-4 py-2 rounded-full font-bold bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border transition-all flex items-center gap-2 active:scale-95"
          title="Shortcut: Key T"
        >
          <Scale class="w-4 h-4 text-primary" />
          <span>Too close to call (Tie)</span>
        </button>

        <button
          @click="ui.closeModal()"
          class="text-text-tertiary hover:text-text-primary font-semibold transition-colors"
        >
          Save & finish later
        </button>
      </div>

      </template>

      <!-- Placement Success State -->
      <template v-else>
        <div class="py-10 text-center space-y-3">
          <CheckCircle2 class="w-12 h-12 text-primary mx-auto" />
          <p class="font-serif font-bold text-2xl text-text-primary">
            Ranking updated!
          </p>
          <p class="sr-only" aria-live="polite" aria-atomic="true">{{ placedResult }}</p>
          <p v-if="placedResult" class="text-sm text-text-secondary font-medium">
            {{ placedResult }}
          </p>
        </div>
      </template>

    </div>
  </div>
</template>
