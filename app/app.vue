<script setup lang="ts">
import { useAuthSession } from './composables/useAuthSession';

const { syncSession } = useAuthSession();
onMounted(() => {
  syncSession();
});
</script>

<template>
  <div>
    <!-- Skip Link -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Skip to main content
    </a>
    <NuxtPage />
  </div>
</template>
