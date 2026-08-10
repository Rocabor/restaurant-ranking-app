<!--* app\components\AuthModal.vue  -->

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { X, AlertCircle, CheckCircle2, Loader2,UtensilsCrossed } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();

const mode = ref<'login' | 'register' | 'reset'>('login');
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

watch(() => ui.activeModal, (val) => {
  if (val === 'auth') {
    errorMessage.value = '';
    successMessage.value = '';
    email.value = '';
    password.value = '';
    isLoading.value = false;
    mode.value = 'login';
  }
});

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    // TODO: Connect to Supabase when configured
    await new Promise(resolve => setTimeout(resolve, 800));

    if (mode.value === 'login') {
      ui.setUser({ email: email.value });
      successMessage.value = 'Welcome back!';
      setTimeout(() => ui.closeModal(), 1000);
    } else if (mode.value === 'register') {
      ui.setUser({ email: email.value });
      successMessage.value = 'Account created successfully. Logged in!';
      setTimeout(() => ui.closeModal(), 1000);
    } else if (mode.value === 'reset') {
      successMessage.value = 'A password recovery link has been sent to your email.';
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'An error occurred during authentication.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'auth'"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-title"
  >
    <div class="relative w-full max-w-sm bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">

      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold text-base">
          <UtensilsCrossed />
          </div>
          <div>
            <h2 id="auth-title" class="font-serif font-bold text-xl text-text-primary">
              {{ mode === 'login' ? 'Log In' : mode === 'register' ? 'Create Account' : 'Reset Password' }}
            </h2>
            <p class="text-xs text-text-tertiary font-medium">
              Save and sync your restaurant map
            </p>
          </div>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Mode Switcher Tabs -->
      <div v-if="mode !== 'reset'" class="grid grid-cols-2 p-1 bg-bg-secondary rounded-2xl border border-border text-xs font-semibold">
        <button
          @click="mode = 'login'"
          class="py-2 rounded-xl transition-all"
          :class="mode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary'"
        >
          Log In
        </button>
        <button
          @click="mode = 'register'"
          class="py-2 rounded-xl transition-all"
          :class="mode === 'register' ? 'bg-surface text-primary shadow-sm' : 'text-text-tertiary'"
        >
          Sign Up
        </button>
      </div>

      <!-- Error / Success Alert -->
      <div v-if="errorMessage" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit" class="space-y-3.5">

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            Email Address
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="you@email.com"
            required
            class="w-full px-3.5 py-2.5 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
          />
        </div>

        <div v-if="mode !== 'reset'">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Password
            </label>
            <button
              v-if="mode === 'login'"
              type="button"
              @click="mode = 'reset'"
              class="text-[11px] text-primary font-semibold hover:underline"
            >
              Forgot your password?
            </button>
          </div>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
            class="w-full px-3.5 py-2.5 text-xs bg-bg-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-text-primary"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span>{{ mode === 'login' ? 'Log In to Tastemap' : mode === 'register' ? 'Create Free Account' : 'Send Recovery Email' }}</span>
        </button>

      </form>

      <!-- Back to Login option if reset -->
      <div v-if="mode === 'reset'" class="text-center pt-2">
        <button
          @click="mode = 'login'"
          class="text-xs text-primary font-semibold hover:underline"
        >
          ← Back to Log In
        </button>
      </div>

      <!-- Guest mode note -->
      <div class="pt-3 border-t border-border text-center text-xs text-text-tertiary">
        <p>You can also use Tastemap in <strong>Guest Mode</strong> without signing up.</p>
      </div>

    </div>
  </div>
</template>
