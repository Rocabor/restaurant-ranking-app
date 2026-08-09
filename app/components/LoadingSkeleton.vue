<script setup lang="ts">
defineProps<{
  count?: number;
}>();
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="i in (count || 5)"
      :key="i"
      class="bg-surface border border-border rounded-xl p-4 animate-pulse"
    >
      <div class="flex items-start gap-3">
        <!-- Avatar skeleton -->
        <div class="w-10 h-10 rounded-full bg-bg-secondary flex-shrink-0"></div>
        
        <div class="flex-1 space-y-2">
          <!-- Title skeleton -->
          <div class="h-4 bg-bg-secondary rounded w-3/4"></div>
          
          <!-- Subtitle skeleton -->
          <div class="h-3 bg-bg-secondary rounded w-1/2"></div>
          
          <!-- Tags skeleton -->
          <div class="flex gap-2">
            <div class="h-5 bg-bg-secondary rounded w-12"></div>
            <div class="h-5 bg-bg-secondary rounded w-16"></div>
          </div>
        </div>

        <!-- Rank skeleton -->
        <div class="w-8 h-8 rounded-lg bg-bg-secondary"></div>
      </div>
    </div>
  </div>
</template>
