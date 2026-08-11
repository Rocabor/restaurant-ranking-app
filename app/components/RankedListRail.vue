<!--* app\components\RankedListRail.vue  -->

<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import PlaceCard from './PlaceCard.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import { Utensils } from '@lucide/vue';
import type { SelectOption } from './SelectDropdown.vue';

const store = usePlacesStore();
const ui = useUIStore();

const sortOptions: SelectOption[] = [
  { value: 'rank', label: 'Sort: Rank' },
  { value: 'name', label: 'Sort: Name' },
  { value: 'dateAdded', label: 'Sort: Recent' },
  { value: 'visits', label: 'Sort: Visits' },
  { value: 'priceLevel', label: 'Sort: Price' },
];

const cuisineOptions = computed<SelectOption[]>(() => [
  { value: 'all', label: `All Cuisines (${store.places.length})` },
  ...store.allCuisines.map((c) => ({ value: c, label: c })),
]);

const cuisineOptionsMobile = computed<SelectOption[]>(() => [
  { value: 'all', label: 'All Cuisines' },
  ...store.allCuisines.map((c) => ({ value: c, label: c })),
]);

const hasActiveFilters = computed(() => {
  return Boolean(
    store.searchQuery ||
    store.selectedCuisine !== 'all' ||
    store.selectedStatus !== 'all' ||
    store.selectedPrice !== null ||
    store.selectedTag ||
    store.selectedArea
  );
});
</script>

<template>
  <!-- Rail Container -->
  <aside
    class="
      flex flex-col h-full bg-bg-primary border-r border-border
      md:relative z-50 md:z-auto
      inset-y-0 left-0
      w-full md:w-75 xl:w-90
    "
    aria-label="Ranked list of places"
  >

    <!-- Header Controls (desktop) -->
    <div class="p-2 border-b border-border bg-surface space-y-3 hidden md:block">

      <!-- Top Title & Counts -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="font-serif font-bold text-xl text-text-primary leading-tight">
            Your Top Tables
          </h2>
          <p class="text-xs text-text-tertiary font-medium mt-0.5">
            {{ store.rankedPlaces.length }} visited • {{ store.wantToTry.length }} to try
          </p>
        </div>

        <!-- Sort Select -->
        <SelectDropdown
          v-model="store.sortBy"
          :options="sortOptions"
          aria-label="Sort places by"
          size="sm"
        />
      </div>

      <!-- Segmented Status Tabs -->
      <div class="grid grid-cols-3 p-1 bg-bg-secondary rounded-xl border border-border text-xs font-semibold" role="group" aria-label="Filter by status">
        <button
          @click="store.selectedStatus = 'all'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'all' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'all'"
        >
          All ({{ store.places.length }})
        </button>
        <button
          @click="store.selectedStatus = 'ranked'"
          class="py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
          :class="store.selectedStatus === 'ranked' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'ranked'"
        >
          <span>Visited</span>
          <span class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
            {{ store.rankedPlaces.length }}
          </span>
        </button>
        <button
          @click="store.selectedStatus = 'want'"
          class="py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
          :class="store.selectedStatus === 'want' ? 'bg-surface text-highlight-strong shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'want'"
        >
          <span>To Try</span>
          <span class="text-[10px] bg-highlight/20 text-highlight-strong px-1.5 py-0.2 rounded-full font-bold">
            {{ store.wantToTry.length }}
          </span>
        </button>
      </div>

      <!-- Cuisine Filter -->
      <div>
        <label for="rail-cuisine-filter" class="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
          Cuisine
        </label>
        <SelectDropdown
          id="rail-cuisine-filter"
          v-model="store.selectedCuisine"
          :options="cuisineOptions"
          aria-label="Filter by cuisine"
          size="md"
          block
        />
      </div>

    </div>

    <!-- Mobile Sort & Filters (simplified) -->
    <div class="p-3 border-b border-border bg-surface space-y-3 md:hidden">
      <div class="flex items-center gap-2">
        <SelectDropdown
          v-model="store.sortBy"
          :options="sortOptions"
          aria-label="Sort places by"
          size="md"
          block
          class="flex-1 min-w-0"
        />
        <SelectDropdown
          v-model="store.selectedCuisine"
          :options="cuisineOptionsMobile"
          aria-label="Filter by cuisine"
          size="md"
          block
          class="flex-1 min-w-0"
        />
      </div>

      <div class="grid grid-cols-3 p-1 bg-bg-secondary rounded-xl border border-border text-xs font-semibold" role="group" aria-label="Filter by status">
        <button
          @click="store.selectedStatus = 'all'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'all' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'all'"
        >
          All
        </button>
        <button
          @click="store.selectedStatus = 'ranked'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'ranked' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'ranked'"
        >
          Visited
        </button>
        <button
          @click="store.selectedStatus = 'want'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'want' ? 'bg-surface text-highlight-strong shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
          :aria-pressed="store.selectedStatus === 'want'"
        >
          To Try
        </button>
      </div>
    </div>

    <!-- Scrollable Cards List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">

      <!-- Loading State -->
      <LoadingSkeleton v-if="store.loading" :count="5" />

      <template v-else>
        <!-- Active Filter Pill Bar (if filtering) -->
        <div v-if="hasActiveFilters" class="flex items-center justify-between bg-bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs text-text-secondary">
          <span aria-live="polite">
            Showing {{ store.filteredPlaces.length }} of {{ store.places.length }} places
          </span>
          <button
            @click="store.clearFilters()"
            class="text-primary font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="store.filteredPlaces.length === 0" class="text-center py-12 px-4 space-y-3">
          <div class="w-12 h-12 rounded-full bg-bg-secondary text-text-tertiary flex items-center justify-center mx-auto">
            <Utensils class="w-6 h-6" />
          </div>
          <h3 class="font-serif font-bold text-lg text-text-primary">
            No matching places
          </h3>
          <p class="text-xs text-text-tertiary max-w-xs mx-auto">
            Try changing your search or removing the applied filters.
          </p>
          <button
            @click="store.clearFilters()"
            class="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-all shadow-sm"
          >
            Reset filters
          </button>
        </div>

        <!-- List Cards -->
        <ol class="space-y-3 list-none p-0 m-0">
          <PlaceCard
            v-for="place in store.filteredPlaces"
            :key="place.id"
            :place="place"
          />
        </ol>
      </template>

    </div>

  </aside>
</template>
