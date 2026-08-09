<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '../stores/ui';
import { AlertTriangle } from '@lucide/vue';

const ui = useUIStore();

const confirmData = computed(() => ui.confirmData);

function handleConfirm() {
  if (confirmData.value?.onConfirm) {
    confirmData.value.onConfirm();
  }
  ui.closeConfirm();
}

function handleCancel() {
  ui.closeConfirm();
}

function onKeyDown(e: KeyboardEvent) {
  if (ui.activeModal !== 'confirm') return;
  if (e.key === 'Escape') {
    handleCancel();
  } else if (e.key === 'Enter') {
    handleConfirm();
  }
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'confirm' && confirmData"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @keydown.window="onKeyDown"
  >
    <div class="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
      <!-- Icon -->
      <div class="flex items-center justify-center">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="confirmData.variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'"
        >
          <AlertTriangle
            class="w-6 h-6"
            :class="confirmData.variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="text-center space-y-2">
        <h3 class="font-serif font-bold text-xl text-text-primary">
          {{ confirmData.title }}
        </h3>
        <p class="text-sm text-text-secondary">
          {{ confirmData.message }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          @click="handleCancel"
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-bg-secondary text-text-secondary hover:bg-bg-tertiary transition-colors border border-border"
        >
          {{ confirmData.cancelText || 'Cancel' }}
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          :class="confirmData.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'"
        >
          {{ confirmData.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>
