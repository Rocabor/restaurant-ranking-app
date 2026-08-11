<!--* app\components\LandingPage.vue  -->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import Navbar from '../components/Navbar.vue';
import AuthModal from '../components/AuthModal.vue';
import { Sparkles, MapPin, Trophy, Dices, Star, ChevronRight, Utensils } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();
const router = useRouter();

const topRankedPreview = computed(() => {
  return store.rankedPlaces.slice(0, 3);
});

function openDemoDuel() {
  router.push('/mapa');
}

function openPlaceOnMap(id: string) {
  store.selectPlace(id);
  router.push('/mapa');
}
</script>

<template>
  <div class="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-primary-subtle selection:text-primary">
    <!-- Top Navbar -->
    <Navbar />

    <main id="main-content" tabindex="-1">
    <!-- Hero Section -->
    <section class="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 overflow-hidden border-b border-border bg-linear-to-b from-surface to-bg-primary">
      <!-- Subtle Background Decorative Blurs -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/5 dark:bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>

      <div class="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        <!-- Category Pill Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-subtle border border-primary/20 text-primary text-xs font-bold tracking-wide shadow-xs animate-fade-in">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Your Food Journal & Personal Ranking</span>
        </div>

        <!-- Main Title -->
        <h1 class="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-text-primary tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your favorite restaurants, ranked by honest
          <span class="text-primary italic underline decoration-highlight decoration-wavy decoration-2">taste duels</span>
          .
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
          Say goodbye to messy lists in your notes app or saving spots on Google Maps without context. Rank restaurants through head-to-head 1v1 comparisons, locate them on the map, and get instant
          inspiration for your next meal out.
        </p>

        <!-- CTA Buttons Group -->
        <div class="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          <button
            @click="ui.openModal('auth')"
            class="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
            <span>Sign Up Free</span>
            <ChevronRight class="w-4 h-4 opacity-80" />
          </button>

          <router-link
            to="/mapa"
            class="px-6 py-3.5 rounded-2xl bg-surface hover:bg-bg-secondary border border-border text-text-primary font-bold text-sm transition-all flex items-center gap-2 active:scale-95 shadow-xs">
            <MapPin class="w-4 h-4 text-highlight-strong" />
            <span>Try as Guest</span>
          </router-link>
        </div>

        <!-- Quick Stats Banner -->
        <div class="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div class="p-3.5 rounded-2xl bg-surface/80 border border-border text-center shadow-2xs">
            <div class="font-serif font-bold text-2xl text-primary">
              {{ store.rankedPlaces?.length || 0 }}
            </div>
            <div class="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">In Your Top</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface/80 border border-border text-center shadow-2xs">
            <div class="font-serif font-bold text-2xl text-highlight-strong">
              {{ store.wantToTry?.length || 0 }}
            </div>
            <div class="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">To Try</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface/80 border border-border text-center shadow-2xs">
            <div class="font-serif font-bold text-2xl text-text-primary">100%</div>
            <div class="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Your Own Taste</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface/80 border border-border text-center shadow-2xs">
            <div class="font-serif font-bold text-2xl text-primary">1v1</div>
            <div class="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Duel Algorithm</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-12">
      <div class="text-center space-y-2">
        <h2 class="font-serif font-bold text-3xl sm:text-4xl text-text-primary">Everything you need for your foodie life</h2>
        <p class="text-sm text-text-tertiary max-w-xl mx-auto font-medium">Tools designed for foodies who value honesty and great meals.</p>
      </div>

      <!-- Grid of 4 Core Pillars -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Feature 1: Duelo de Sabor -->
        <div class="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 transition-all shadow-sm space-y-4 group">
          <div class="p-3 rounded-2xl bg-primary-subtle text-primary w-fit">
            <Trophy class="w-6 h-6" />
          </div>
          <div class="space-y-1.5">
            <h3 class="font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors">1v1 Duel Ranking</h3>
            <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Rating spots on a 1-10 scale is confusing. In Tastemap, you compare two restaurants at a time: which one do you prefer? The system automatically places each new spot in its exact ranking
              position.
            </p>
          </div>
        </div>

        <!-- Feature 2: Mapa Interactivo -->
        <div class="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 transition-all shadow-sm space-y-4 group">
          <div class="p-3 rounded-2xl bg-primary-subtle text-primary w-fit">
            <MapPin class="w-6 h-6" />
          </div>
          <div class="space-y-1.5">
            <h3 class="font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors">Geolocated Map & Filters</h3>
            <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Locate your restaurants on the map in real time. Filter by cuisine type (Italian, Asian, Tacos...), neighborhood, or price point with a single tap to see what's nearby.
            </p>
          </div>
        </div>

        <!-- Feature 3: Ruleta Decisora -->
        <div class="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 transition-all shadow-sm space-y-4 group">
          <div class="p-3 rounded-2xl bg-(--color-highlight-subtle) text-highlight-strong w-fit">
            <Dices class="w-6 h-6" />
          </div>
          <div class="space-y-1.5">
            <h3 class="font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors">"Where to Eat Today?" Wheel</h3>
            <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Can't decide on dinner? Filter by your "To Try" list or "Favorites" and let the interactive spinner pick the ideal spot—argument free.
            </p>
          </div>
        </div>

        <!-- Feature 4: Lista Want to Try -->
        <div class="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 transition-all shadow-sm space-y-4 group">
          <div class="p-3 rounded-2xl bg-primary-subtle text-primary w-fit">
            <Star class="w-6 h-6" />
          </div>
          <div class="space-y-1.5">
            <h3 class="font-serif font-bold text-xl text-text-primary group-hover:text-primary transition-colors">Want-to-Try List</h3>
            <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Keep a separate list of every place you still want to try. Search and add restaurants from anywhere in the world, then revisit the list when you're hungry for something new.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Preview Showcase Section -->
    <section class="py-12 px-4 sm:px-6 bg-bg-secondary border-y border-border">
      <div class="max-w-5xl mx-auto space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-bold text-primary uppercase tracking-wider">Live Preview</span>
            <h2 class="font-serif font-bold text-2xl sm:text-3xl text-text-primary mt-1">Your Current Foodie Top</h2>
            <p class="text-xs text-text-tertiary font-medium">Here are some of the highest rated places in your collection</p>
          </div>

          <router-link to="/mapa" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold w-fit hover:bg-primary-hover transition-all flex items-center gap-1.5">
            <span>View full map ({{ store.places?.length || 0 }} restaurants)</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- Mini Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <router-link
            v-for="place in topRankedPreview"
            :key="place.id"
            :to="'/mapa'"
            @click="openPlaceOnMap(place.id)"
            class="p-4 rounded-2xl bg-surface border border-border hover:border-primary focus-visible:border-primary transition-all cursor-pointer shadow-xs space-y-2 group">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary text-on-primary">Rank #{{ place.rank }}</span>
              <span class="text-xs font-bold text-primary">
                {{ '£'.repeat(place.priceLevel) }}
              </span>
            </div>

            <h3 class="font-serif font-bold text-lg text-text-primary group-hover:text-primary transition-colors leading-tight">
              {{ place.name }}
            </h3>

            <p class="text-xs text-text-tertiary font-medium">
              📍 {{ place.area }} •
              <span class="text-primary font-semibold">{{ place.cuisine }}</span>
            </p>

            <div v-if="place.specialty" class="text-xs text-text-secondary italic bg-bg-secondary p-2 rounded-lg border border-border">⭐ "{{ place.specialty }}"</div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Bottom CTA Banner -->
    <section class="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">      <div class="p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-xl space-y-6 relative overflow-hidden">
        <div class="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto shadow-sm">
          <Utensils class="w-6 h-6" />
        </div>

        <div class="space-y-2 max-w-2xl mx-auto">
          <h2 class="font-serif font-bold text-2xl sm:text-3xl text-text-primary">Ready to build your personal restaurant map?</h2>
          <p class="text-xs sm:text-sm text-text-secondary">Add your first restaurant, test it in a duel, and build your honest top ranking.</p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            @click="ui.openModal('auth')"
            class="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2">
            <span>Sign Up Free</span>
          </button>

          <router-link
            to="/mapa"
            class="px-5 py-3 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-primary font-bold text-xs transition-all active:scale-95 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-primary" />
            <span>Try as Guest</span>
          </router-link>
        </div>
      </div>
    </section>

    </main>

    <!-- Footer -->
    <footer class="mt-auto py-6 border-t border-border bg-surface text-center text-xs text-text-tertiary font-medium">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <!-- Logo / Marca -->
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary text-on-primary font-serif font-bold text-xs flex items-center justify-center">
            <MapPin class="w-3 h-3 text-on-primary" />
          </div>
          <span class="font-serif font-bold text-sm text-text-primary">Tastemap</span>
          <span>— Your personal food journal</span>
        </div>

        <!-- Atribución con la misma tipografía y estilos del footer -->
        <nav aria-label="Attribution credits" class="flex flex-wrap items-center justify-center gap-1 text-xs text-text-tertiary font-medium">
          <span>Challenge by</span>
          <a
            href="https://www.frontendmentor.io?ref=challenge"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-primary font-bold transition-all duration-300 ease-in-out hover:text-primary focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-xs">
            Frontend Mentor
          </a>
          <span>• Coded by</span>
          <a
            href="https://www.frontendmentor.io/profile/Rocabor"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-primary font-bold transition-all duration-300 ease-in-out hover:text-primary focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-xs">
            @Rocabor
          </a>
          <span class="text-text-primary font-bold">&copy;{{ new Date().getFullYear() }}</span>
        </nav>
      </div>
    </footer>

    <!-- Auth Modal -->
    <AuthModal />
  </div>
</template>
