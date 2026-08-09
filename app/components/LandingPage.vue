<script setup lang="ts">
import { useUIStore } from '../stores/ui';
import { MapPin, ListOrdered, BarChart3, Sparkles, Star } from '@lucide/vue';

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

function handleSignIn() {
  ui.openModal('auth');
}

function handleTryAsGuest() {
  ui.hideLanding();
}
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
            @click="handleSignIn"
            class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </button>
          <button
            @click="handleTryAsGuest"
            class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-colors"
          >
            Try as Guest
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="pt-32 pb-12 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight mb-6">
          Star ratings are useless.<br />
          <span class="text-primary">Rank where you actually eat.</span>
        </h1>
        <p class="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Tastemap is your personal map and honestly-ranked list of every place you've eaten — 
          and every place you still want to try.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="handleSignIn"
            class="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Sign Up
          </button>
          <button
            @click="handleTryAsGuest"
            class="px-6 py-3 bg-surface text-text-primary font-semibold rounded-full border border-border hover:border-primary transition-all active:scale-95"
          >
            Try as Guest
          </button>
        </div>
      </div>
    </section>

    <!-- Map Preview -->
    <section class="px-6 pb-12">
      <div class="max-w-4xl mx-auto">
        <div class="relative rounded-xl overflow-hidden shadow-xl border border-border bg-bg-secondary">
          <!-- Map Background Simulation -->
          <div class="aspect-[16/9] relative overflow-hidden">
            <!-- Simulated Map Grid -->
            <div class="absolute inset-0 opacity-10">
              <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <!-- Simulated Map Pins -->
            <div class="absolute inset-0">
              <!-- Ranked Pins -->
              <div class="absolute top-[25%] left-[20%] group cursor-pointer">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transform hover:scale-110 transition-transform">
                  1
                </div>
                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Brat — #1
                </div>
              </div>

              <div class="absolute top-[35%] right-[30%] group cursor-pointer">
                <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transform hover:scale-110 transition-transform">
                  2
                </div>
                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Clove Club — #2
                </div>
              </div>

              <!-- Want to Try Pin -->
              <div class="absolute bottom-[35%] right-[20%] group cursor-pointer">
                <div class="w-7 h-7 bg-highlight rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform">
                  <Star class="w-3 h-3" fill="currentColor" />
                </div>
                <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Dishoom — Want to try
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3 text-xs">
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold">1</div>
                  <span class="text-gray-600 dark:text-gray-400">Ranked</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white">
                    <Star class="w-2.5 h-2.5" fill="currentColor" />
                  </div>
                  <span class="text-gray-600 dark:text-gray-400">Want to try</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Caption -->
        <p class="text-center text-sm text-text-tertiary mt-4">
          Every pin tells a story. Green pins show your ranked favourites, amber pins are places waiting to be explored.
        </p>
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

    <!-- Social Proof -->
    <section class="px-6 py-16 bg-bg-secondary">
      <div class="max-w-4xl mx-auto">
        <div class="bg-surface rounded-2xl p-8 md:p-12 border border-border shadow-lg">
          <div class="text-center mb-8">
            <p class="text-lg text-text-secondary italic">
              "I used to have 500 places saved on Google Maps and never knew where to actually go. Tastemap changed that."
            </p>
          </div>
          <div class="flex items-center justify-center gap-8 text-sm text-text-tertiary">
            <div class="text-center">
              <p class="font-serif font-bold text-2xl text-text-primary">32</p>
              <p>Sample places</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center">
              <p class="font-serif font-bold text-2xl text-text-primary">25</p>
              <p>Comparisons made</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center">
              <p class="font-serif font-bold text-2xl text-text-primary">10+</p>
              <p>Cuisines covered</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 py-16">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="font-display text-3xl font-semibold text-text-primary mb-4">
          Ready to map your taste?
        </h2>
        <p class="text-sm text-text-secondary mb-6">
          No credit card required. Guest data is session-based only.
        </p>
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
