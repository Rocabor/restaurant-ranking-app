<script setup lang="ts">
import { useUIStore } from '../stores/ui';
import { MapPin, ListOrdered, BarChart3, Sparkles, ChevronRight } from '@lucide/vue';

const ui = useUIStore();

const features = [
  {
    icon: MapPin,
    title: 'Map Your City',
    description: 'Every place you\'ve eaten, every place you want to try — all on one beautiful map.',
  },
  {
    icon: ListOrdered,
    title: 'Honest Rankings',
    description: 'No more inflated star ratings. Compare places head-to-head and build a ranking you actually trust.',
  },
  {
    icon: BarChart3,
    title: 'Taste Stats',
    description: 'See your eating life at a glance — cuisines explored, neighbourhoods covered, price spread.',
  },
  {
    icon: Sparkles,
    title: 'Decide Instantly',
    description: '"Where should we eat?" — let the app pick from your list based on mood, price, and location.',
  },
];

const handleGetStarted = () => {
  ui.hideLanding();
};
</script>

<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <MapPin class="w-4 h-4 text-white" />
          </div>
          <span class="font-display text-xl font-semibold text-text-primary">Tastemap</span>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="handleGetStarted"
            class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </button>
          <button
            @click="handleGetStarted"
            class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-colors"
          >
            Try as Guest
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-text-primary leading-tight mb-6">
          Star ratings are useless.<br />
          <span class="text-primary">Rank where you actually eat.</span>
        </h1>
        <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Tastemap is your personal map and honestly-ranked list of every place you've eaten — 
          and every place you still want to try.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="handleGetStarted"
            class="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Get Started Free
          </button>
          <button
            @click="handleGetStarted"
            class="px-8 py-4 bg-surface text-text-primary font-semibold rounded-full border border-border hover:border-primary transition-all active:scale-95"
          >
            Try as Guest
          </button>
        </div>
      </div>
    </section>

    <!-- Map Preview -->
    <section class="px-6 pb-20">
      <div class="max-w-6xl mx-auto">
        <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface">
          <div class="aspect-[16/9] bg-bg-secondary flex items-center justify-center">
            <div class="text-center p-8">
              <div class="flex justify-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin class="w-6 h-6 text-primary" />
                </div>
                <div class="w-12 h-12 rounded-full bg-highlight/20 flex items-center justify-center">
                  <MapPin class="w-6 h-6 text-highlight" />
                </div>
                <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin class="w-6 h-6 text-primary" />
                </div>
              </div>
              <p class="text-text-tertiary text-sm">Interactive map with your places</p>
            </div>
          </div>
          <!-- Decorative pins -->
          <div class="absolute top-1/4 left-1/4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">1</div>
          <div class="absolute top-1/3 right-1/3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">2</div>
          <div class="absolute bottom-1/3 left-1/3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">3</div>
          <div class="absolute top-1/2 right-1/4 w-8 h-8 bg-highlight rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            <Sparkles class="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="px-6 py-20 bg-bg-secondary">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-display text-3xl md:text-4xl font-semibold text-text-primary text-center mb-16">
          Everything you need to map your taste
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-surface rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
          >
            <div class="w-12 h-12 rounded-lg bg-primary-subtle flex items-center justify-center mb-4">
              <component :is="feature.icon" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold text-text-primary mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-text-secondary leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <h2 class="font-display text-3xl md:text-4xl font-semibold text-text-primary text-center mb-16">
          How it works
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
            <h3 class="font-semibold text-text-primary mb-2">Add places</h3>
            <p class="text-sm text-text-secondary">Log everywhere you eat and everywhere you want to try.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
            <h3 class="font-semibold text-text-primary mb-2">Compare</h3>
            <p class="text-sm text-text-secondary">Answer quick "which was better?" questions to build your honest ranking.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
            <h3 class="font-semibold text-text-primary mb-2">Decide</h3>
            <p class="text-sm text-text-secondary">Never ask "where should we eat?" again — your map has the answer.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 py-20 bg-bg-secondary">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-6">
          Ready to map your taste?
        </h2>
        <p class="text-lg text-text-secondary mb-8">
          Join Tastemap and start building a ranking you actually trust.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="handleGetStarted"
            class="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center justify-center gap-2"
          >
            Get Started Free
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-6 py-8 border-t border-border">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <MapPin class="w-3 h-3 text-white" />
          </div>
          <span class="font-display text-sm font-semibold text-text-primary">Tastemap</span>
        </div>
        <p class="text-sm text-text-tertiary">
          Built with care for honest food opinions.
        </p>
      </div>
    </footer>
  </div>
</template>
