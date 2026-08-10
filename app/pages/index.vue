<!--* app\pages\index.vue  -->

<script setup lang="ts">
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { List } from '@lucide/vue';

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
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Navbar />
    <div class="flex h-[calc(100dvh-64px)]">
      <button
        @click="ui.toggleRail()"
        class="fixed bottom-6 left-6 z-30 lg:hidden w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-hover transition-all active:scale-95"
        aria-label="Toggle restaurant list"
      >
        <List class="w-5 h-5" />
      </button>

      <RankedListRail />
      <main id="main-content" class="flex-1 bg-bg-primary relative" tabindex="-1">
        <ClientOnly>
          <InteractiveMap />
        </ClientOnly>
        <PlaceDetailSheet />
      </main>
    </div>
    <ShareModal />
    <TasteStatsModal />
    <DeciderModal />
    <AuthModal />
    <PlaceFormModal />
    <ComparisonDuelModal />
    <ConfirmModal />
  </div>

  </template>
