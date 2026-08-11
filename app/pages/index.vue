<!--* app\pages\index.vue  -->

<script setup lang="ts">
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { Map, List } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();
const route = useRoute();

onMounted(() => {
  ui.initDarkMode();
  store.loadData();
  if (route.path === '/') {
    ui.showLanding = true;
  }
});
</script>

<template>
  <LandingPage v-if="ui.showLanding" />

  <div v-else>
    <Navbar />
    <!-- Mobile Segmented Control — below navbar, full width -->
    <div class="md:hidden flex p-1 bg-bg-secondary border-b border-border" role="group" aria-label="Switch between map and list view">
      <button
        @click="ui.setMobileView('map')"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all rounded-lg"
        :class="ui.mobileView === 'map' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        :aria-pressed="ui.mobileView === 'map'"
      >
        <Map class="w-4 h-4" />
        <span>Map</span>
      </button>
      <button
        @click="ui.setMobileView('list')"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all rounded-lg"
        :class="ui.mobileView === 'list' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'"
        :aria-pressed="ui.mobileView === 'list'"
      >
        <List class="w-4 h-4" />
        <span>List ({{ store.places.length }})</span>
      </button>
    </div>

    <div class="flex h-[calc(100dvh-64px-40px)] md:h-[calc(100dvh-64px)]">
      <!-- Ranked List Rail -->
      <div
        class="h-full overflow-hidden transition-all duration-300 ease-in-out"
        :class="ui.mobileView === 'list' ? 'w-full' : 'w-0 md:w-75 xl:w-90'"
      >
        <RankedListRail />
      </div>

      <!-- Map -->
      <main
        id="main-content"
        class="flex-1 bg-bg-primary relative min-w-0"
        tabindex="-1"
        :class="ui.mobileView === 'map' ? 'block' : 'hidden md:block'"
      >
        <ClientOnly>
          <InteractiveMap />
        </ClientOnly>
      </main>

      <!-- Detail Sheet -->
    <PlaceDetailSheet />
  </div>
    <TasteStatsModal />
    <DeciderModal />
    <AuthModal />
    <PlaceFormModal />
    <ComparisonDuelModal />
    <ConfirmModal />
  </div>

  </template>
