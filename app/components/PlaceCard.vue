<!--* app\components\PlaceCard.vue  -->

<template>
  <div
    @click="store.selectPlace(place.id)"
    @mouseenter="store.setHoveredPlace(place.id)"
    @mouseleave="store.setHoveredPlace(null)"
    class="group relative bg-surface border rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
    :class="[
      isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-border',
      isHovered ? 'border-primary' : ''
    ]"
    role="button"
    tabindex="0"
    :aria-label="`${place.name}, ${place.cuisine}, ${place.area}, ${place.status === 'ranked' ? `ranked #${place.rank}` : 'want to try'}`"
    @keydown.enter="store.selectPlace(place.id)"
    @keydown.space.prevent="store.selectPlace(place.id)"
  >
    <div class="flex items-start gap-3.5">

      <!-- Rank Numeral or Avatar -->
      <div class="shrink-0 flex flex-col items-center">
        <!-- Ranked Numeral -->
        <div
          v-if="place.status === 'ranked' && place.rank !== null"
          class="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-lg leading-none shadow-sm transition-transform group-hover:scale-105"
          :class="[
            place.rank === 1
              ? 'bg-highlight text-text-primary ring-4 ring-highlight/30'
              : 'bg-bg-secondary text-text-primary border border-border'
          ]"
        >
          {{ place.rank }}
        </div>

        <!-- Want Avatar -->
        <div
          v-else
          class="w-9 h-9 rounded-full bg-bg-secondary text-highlight-strong border border-border flex items-center justify-center font-bold text-sm shadow-sm"
        >
          ★
        </div>

        <!-- Top Pick Label -->
        <span v-if="place.rank === 1" class="text-[9px] font-bold uppercase tracking-wider text-highlight-strong mt-1">
          Top Pick
        </span>
      </div>

      <!-- Main Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold text-base text-text-primary truncate group-hover:text-primary transition-colors">
            {{ place.name }}
          </h3>

          <!-- Price Level -->
          <span class="text-xs font-medium text-text-tertiary shrink-0">
            {{ getPriceGrapheme(place.priceLevel) }}
          </span>
        </div>

        <!-- Cuisine & Area -->
        <div class="flex flex-wrap items-center gap-1.5 mt-1">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-text-primary bg-bg-secondary">
            {{ place.cuisine }}
          </span>

          <span class="text-xs text-text-tertiary font-medium">
            • {{ place.area }}
          </span>

          <span v-if="place.status === 'ranked' && place.visits > 0" class="text-[11px] text-text-tertiary">
            • {{ place.visits }} {{ place.visits === 1 ? 'visit' : 'visits' }}
          </span>
        </div>

        <!-- Specialty -->
        <p v-if="place.specialty" class="text-xs text-text-secondary font-medium mt-1 truncate">
          {{ place.specialty }}
        </p>

        <!-- Personal Note Snippet -->
        <p v-if="place.note" class="text-xs text-text-tertiary italic mt-1.5 line-clamp-2 leading-relaxed">
          "{{ place.note }}"
        </p>

        <!-- Tags -->
        <div v-if="place.tags && place.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in place.tags.slice(0, 3)"
            :key="tag"
            class="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary font-medium"
          >
            #{{ tag }}
          </span>
          <span v-if="place.tags.length > 3" class="text-[10px] text-text-tertiary">
            +{{ place.tags.length - 3 }}
          </span>
        </div>

      </div>

      <!-- Action Arrow -->
      <div class="shrink-0 text-text-tertiary group-hover:text-primary transition-colors self-center">
        <ChevronRight class="w-4 h-4" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import type { Place } from '~/types';
import { ChevronRight } from '@lucide/vue';

const props = defineProps<{
  place: Place;
}>();

const store = usePlacesStore();

const isSelected = computed(() => store.selectedPlaceId === props.place.id);
const isHovered = computed(() => store.hoveredPlaceId === props.place.id);

function getPriceGrapheme(level: number) {
  return '£'.repeat(level || 1);
}
</script>
