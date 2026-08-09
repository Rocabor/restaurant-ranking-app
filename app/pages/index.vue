<!--* app\pages\index.vue  -->

<script setup lang="ts">
import { usePlacesStore } from '../stores/places';

const store = usePlacesStore();

onMounted(() => {
  store.loadData();
});
</script>

<template>
  <Navbar />
  <ShareModal />
  <TasteStatsModal />
  <DeciderModal />
  <AuthModal />
</template>
