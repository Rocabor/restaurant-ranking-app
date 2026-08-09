 <!--* app\components\ComparisonDuelModal.vue  -->

<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { Trophy, Scale, CheckCircle2 } from '@lucide/vue';
import { useConfetti } from '../composables/useConfetti';

const store = usePlacesStore();
const ui = useUIStore();
const { fireConfetti } = useConfetti();

const duelPlaceObj = computed(() => {
  if (!store.duelPlace) return null;
  if (typeof store.duelPlace === 'string') {
    return store.places.find(p => p.id === store.duelPlace) || null;
  }
  return store.duelPlace;
});

function onKeyDown(e: KeyboardEvent) {
  if (ui.activeModal !== 'duel') return;

  if (e.key === '1' || e.key === 'ArrowLeft') {
    e.preventDefault();
    handleChoice('A');
  } else if (e.key === '2' || e.key === 'ArrowRight') {
    e.preventDefault();
    handleChoice('B');
  } else if (e.key === 't' || e.key === 'T' || e.key === ' ') {
    e.preventDefault();
    handleChoice('tie');
  } else if (e.key === 'Escape') {
    ui.closeModal();
  }
}

function handleChoice(choice: 'A' | 'B' | 'tie') {
  store.handleDuelChoice(choice);
  if (choice !== 'tie') {
    fireConfetti();
  }
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'duel' && duelPlaceObj && store.currentOpponent"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @keydown.window="onKeyDown"
  >
    <div class="relative w-full max-w-2xl max-h-[92vh] bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 overflow-y-auto scrollbar-thin my-auto animate-fade-in">

      <!-- Modal Header & Progress -->
      <div class="space-y-2 text-center">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
          <Trophy class="w-4 h-4" />
          <span>Taste Duel • Head-to-Head Comparison</span>
        </div>

        <h2 class="font-serif font-bold text-2xl text-gray-900 dark:text-gray-100">
          Which one do you prefer?
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
          Compare specialties, reviews, and price levels to determine the exact spot in your ranking
        </p>

        <!-- Progress Bar -->
        <div class="w-full max-w-xs mx-auto space-y-1 pt-1">
          <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div
              class="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              :style="{ width: `${store.duelProgress}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            Approximate progress ~{{ store.duelProgress }}%
          </p>
        </div>
      </div>

      <!-- Duel Options Comparison Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

        <!-- OPTION A CARD -->
        <div
          @click="handleChoice('A')"
          class="group relative bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4 cursor-pointer"
        >
          <div class="space-y-3">

            <!-- Badges Bar -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                Option A
              </span>

              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                  :class="duelPlaceObj.status === 'ranked' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'"
                >
                  {{ duelPlaceObj.status === 'ranked' ? `Rank #${duelPlaceObj.rank || '?'}` : '★ Want to try' }}
                </span>
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {{ '£'.repeat(duelPlaceObj.priceLevel || 1) }}
                </span>
              </div>
            </div>

            <!-- Title & Basic Details -->
            <div>
              <h3 class="font-serif font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                {{ duelPlaceObj.name }}
              </h3>
              <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                🍽️ {{ duelPlaceObj.cuisine }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
                📍 {{ duelPlaceObj.area }} {{ duelPlaceObj.address ? `— ${duelPlaceObj.address}` : '' }}
              </p>
            </div>

            <!-- Signature Dish -->
            <div v-if="duelPlaceObj.specialty" class="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                ⭐ Signature Dish
              </span>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-300 italic">
                "{{ duelPlaceObj.specialty }}"
              </p>
            </div>

            <!-- Review / Note -->
            <div v-if="duelPlaceObj.note" class="p-2.5 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                📝 Review / Note
              </span>
              <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic line-clamp-3">
                "{{ duelPlaceObj.note }}"
              </p>
            </div>

            <!-- Visits & Tags -->
            <div class="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              <span v-if="duelPlaceObj.visits" class="font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                👥 {{ duelPlaceObj.visits }} {{ duelPlaceObj.visits === 1 ? 'visit' : 'visits' }}
              </span>

              <template v-if="duelPlaceObj.tags && duelPlaceObj.tags.length">
                <span v-for="t in duelPlaceObj.tags.slice(0, 3)" :key="t" class="px-1.5 py-0.5 rounded bg-white dark:bg-gray-900 text-[10px] border border-gray-200 dark:border-gray-700">
                  #{{ t }}
                </span>
              </template>
            </div>

          </div>

          <button
            @click.stop="handleChoice('A')"
            class="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-600 text-white group-hover:bg-emerald-700 transition-all shadow-md active:scale-95 mt-auto flex items-center justify-center gap-2"
          >
            <span>Choose {{ duelPlaceObj.name }}</span>
            <CheckCircle2 class="w-4 h-4" />
          </button>
        </div>

        <!-- OPTION B CARD -->
        <div
          @click="handleChoice('B')"
          class="group relative bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4 cursor-pointer"
        >
          <div class="space-y-3">

            <!-- Badges Bar -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-xs">
                Option B
              </span>

              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                  :class="store.currentOpponent.status === 'ranked' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'"
                >
                  {{ store.currentOpponent.status === 'ranked' ? `Rank #${store.currentOpponent.rank || '?'}` : '★ Want to try' }}
                </span>
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {{ '£'.repeat(store.currentOpponent.priceLevel || 1) }}
                </span>
              </div>
            </div>

            <!-- Title & Basic Details -->
            <div>
              <h3 class="font-serif font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                {{ store.currentOpponent.name }}
              </h3>
              <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                🍽️ {{ store.currentOpponent.cuisine }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
                📍 {{ store.currentOpponent.area }} {{ store.currentOpponent.address ? `— ${store.currentOpponent.address}` : '' }}
              </p>
            </div>

            <!-- Signature Dish -->
            <div v-if="store.currentOpponent.specialty" class="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                ⭐ Signature Dish
              </span>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-300 italic">
                "{{ store.currentOpponent.specialty }}"
              </p>
            </div>

            <!-- Review / Note -->
            <div v-if="store.currentOpponent.note" class="p-2.5 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                📝 Review / Note
              </span>
              <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic line-clamp-3">
                "{{ store.currentOpponent.note }}"
              </p>
            </div>

            <!-- Visits & Tags -->
            <div class="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              <span v-if="store.currentOpponent.visits" class="font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                👥 {{ store.currentOpponent.visits }} {{ store.currentOpponent.visits === 1 ? 'visit' : 'visits' }}
              </span>

              <template v-if="store.currentOpponent.tags && store.currentOpponent.tags.length">
                <span v-for="t in store.currentOpponent.tags.slice(0, 3)" :key="t" class="px-1.5 py-0.5 rounded bg-white dark:bg-gray-900 text-[10px] border border-gray-200 dark:border-gray-700">
                  #{{ t }}
                </span>
              </template>
            </div>

          </div>

          <button
            @click.stop="handleChoice('B')"
            class="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 group-hover:border-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all shadow-md active:scale-95 mt-auto flex items-center justify-center gap-2"
          >
            <span>Choose {{ store.currentOpponent.name }}</span>
            <CheckCircle2 class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Tie & Cancel Controls -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
        <button
          @click="handleChoice('tie')"
          class="px-4 py-2 rounded-full font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-2 active:scale-95"
          title="Shortcut: Key T or Space"
        >
          <Scale class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Too close to call (Tie)</span>
        </button>

        <button
          @click="ui.closeModal()"
          class="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-colors"
        >
          Save & finish later
        </button>
      </div>

    </div>
  </div>
</template>
