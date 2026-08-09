<!--* app\components\RankedListRail.vue  -->

<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import PlaceCard from './PlaceCard.vue';
import { Utensils, X } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();

const hasActiveFilters = computed(() => {
  return Boolean(
    ui.searchQuery ||
    store.selectedCuisine !== 'all' ||
    store.selectedStatus !== 'all' ||
    store.selectedPrice !== null ||
    store.selectedTag ||
    store.selectedArea
  );
});
</script>

<template>
  <!-- Mobile Overlay -->
  <div
    v-if="ui.isRailOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="ui.closeRail()"
  />

  <!-- Rail Container -->
  <div
    class="
      flex flex-col h-full bg-bg-primary border-r border-border
      fixed lg:relative z-50 lg:z-auto
      inset-y-0 left-0
      w-[85vw] sm:w-90 lg:w-85 xl:w-100
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0
      lg:transform-none
    "
    :class="ui.isRailOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >

    <!-- Mobile Close Button -->
    <div class="flex items-center justify-between p-4 border-b border-border bg-surface lg:hidden">
      <h2 class="font-serif font-bold text-lg text-text-primary">
        Your Tables
      </h2>
      <button
        @click="ui.closeRail()"
        class="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Header Controls -->
    <div class="p-4 border-b border-border bg-surface space-y-3 hidden lg:block">

      <!-- Top Title & Counts -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="font-serif font-bold text-xl text-text-primary leading-tight">
            Your Tables
          </h2>
          <p class="text-xs text-text-tertiary font-medium mt-0.5">
            {{ store.rankedPlaces.length }} visited • {{ store.wantToTry.length }} to try
          </p>
        </div>

        <!-- Sort Select -->
        <select
          v-model="store.sortBy"
          class="text-xs bg-bg-secondary text-text-secondary border border-border rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="rank">Sort: Rank</option>
          <option value="name">Sort: Name</option>
          <option value="dateAdded">Sort: Recent</option>
          <option value="visits">Sort: Visits</option>
          <option value="priceLevel">Sort: Price</option>
        </select>
      </div>

      <!-- Segmented Status Tabs -->
      <div class="grid grid-cols-3 p-1 bg-bg-secondary rounded-xl border border-border text-xs font-semibold">
        <button
          @click="store.selectedStatus = 'all'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'all' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        >
          All ({{ store.places.length }})
        </button>
        <button
          @click="store.selectedStatus = 'ranked'"
          class="py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
          :class="store.selectedStatus === 'ranked' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
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
        >
          <span>To Try</span>
          <span class="text-[10px] bg-highlight/20 text-highlight-strong px-1.5 py-0.2 rounded-full font-bold">
            {{ store.wantToTry.length }}
          </span>
        </button>
      </div>

      <!-- Scrollable Cuisine Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
        <button
          @click="store.selectedCuisine = 'all'"
          class="px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
          :class="store.selectedCuisine === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'"
        >
          All Cuisines
        </button>

        <button
          v-for="cuisine in store.allCuisines"
          :key="cuisine"
          @click="store.selectedCuisine = cuisine"
          class="px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
          :class="store.selectedCuisine === cuisine ? 'bg-primary text-white shadow-sm' : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'"
        >
          {{ cuisine }}
        </button>
      </div>

    </div>

    <!-- Mobile Sort & Filters (simplified) -->
    <div class="p-3 border-b border-border bg-surface space-y-3 lg:hidden">
      <div class="flex items-center gap-2">
        <select
          v-model="store.sortBy"
          class="flex-1 text-xs bg-bg-secondary text-text-secondary border border-border rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="rank">Sort: Rank</option>
          <option value="name">Sort: Name</option>
          <option value="dateAdded">Sort: Recent</option>
          <option value="visits">Sort: Visits</option>
          <option value="priceLevel">Sort: Price</option>
        </select>
      </div>

      <div class="grid grid-cols-3 p-1 bg-bg-secondary rounded-xl border border-border text-xs font-semibold">
        <button
          @click="store.selectedStatus = 'all'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'all' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        >
          All
        </button>
        <button
          @click="store.selectedStatus = 'ranked'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'ranked' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        >
          Visited
        </button>
        <button
          @click="store.selectedStatus = 'want'"
          class="py-1.5 rounded-lg transition-all"
          :class="store.selectedStatus === 'want' ? 'bg-surface text-highlight-strong shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        >
          To Try
        </button>
      </div>
    </div>

    <!-- Scrollable Cards List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">

      <!-- Active Filter Pill Bar (if filtering) -->
      <div v-if="hasActiveFilters" class="flex items-center justify-between bg-bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs text-text-secondary">
        <span>
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
      <PlaceCard
        v-for="place in store.filteredPlaces"
        :key="place.id"
        :place="place"
      />

    </div>

  </div>
</template>
