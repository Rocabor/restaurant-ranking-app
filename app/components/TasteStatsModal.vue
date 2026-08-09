<!--* app\components\TasteStatsModal.vue  -->

<script setup lang="ts">
import { computed } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { BarChart3, X, Trophy, Compass, Award } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();

const topPick = computed(() => {
  return store.rankedPlaces.find(p => p.rank === 1) || null;
});

const totalVisits = computed(() => {
  return store.places.reduce((acc, p) => acc + (p.visits || 0), 0);
});

const explorationRate = computed(() => {
  if (store.places.length === 0) return 0;
  return Math.round((store.rankedPlaces.length / store.places.length) * 100);
});

const averagePriceString = computed(() => {
  if (store.places.length === 0) return '££';
  const total = store.places.reduce((acc, p) => acc + (p.priceLevel || 2), 0);
  const avg = Math.round(total / store.places.length);
  return '£'.repeat(Math.max(1, Math.min(4, avg)));
});

const cuisineStats = computed(() => {
  const counts: Record<string, number> = {};
  const total = store.places.length || 1;

  store.places.forEach(p => {
    if (p.cuisine) {
      counts[p.cuisine] = (counts[p.cuisine] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
});

const areaStats = computed(() => {
  const counts: Record<string, number> = {};
  const total = store.places.length || 1;

  store.places.forEach(p => {
    if (p.area) {
      counts[p.area] = (counts[p.area] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
});

const badges = computed(() => {
  const cuisinesCount = cuisineStats.value.length;
  const areasCount = areaStats.value.length;
  const hasFineDining = store.places.some(p => p.priceLevel === 4);

  return [
    {
      icon: '🏆',
      title: 'Podium King',
      desc: 'Has a defined and evaluated #1 place',
      unlocked: !!topPick.value
    },
    {
      icon: '🌍',
      title: 'Global Palate',
      desc: 'Logged more than 4 different types of cuisine',
      unlocked: cuisinesCount >= 4
    },
    {
      icon: '📍',
      title: 'Urban Explorer',
      desc: 'Logged places in at least 3 neighborhoods',
      unlocked: areasCount >= 3
    },
    {
      icon: '💎',
      title: 'Gourmet Expert',
      desc: 'Features high-end places (££££)',
      unlocked: hasFineDining
    }
  ];
});

function filterByCuisine(cuisineName: string) {
  ui.searchQuery = cuisineName;
  ui.closeModal();
}

function filterByArea(areaName: string) {
  ui.searchQuery = areaName;
  ui.closeModal();
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'stats'"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <div class="relative w-full max-w-xl max-h-[90vh] bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-6 overflow-y-auto scrollbar-thin animate-fade-in my-auto">

      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div class="flex items-center gap-2.5">
          <div class="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <BarChart3 class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-serif font-bold text-xl text-text-primary">
              Your Foodie Insights
            </h2>
            <p class="text-xs text-text-tertiary font-medium">
              Dining habits, favorite spots, and culinary achievements
            </p>
          </div>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-2xl bg-bg-secondary border border-border text-center space-y-0.5">
          <div class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Places On Map
          </div>
          <div class="text-2xl font-serif font-bold text-text-primary">
            {{ store.places.length }}
          </div>
          <div class="text-[10px] text-text-tertiary">
            {{ store.rankedPlaces.length }} visited • {{ store.wantToTry.length }} to try
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-bg-secondary border border-border text-center space-y-0.5">
          <div class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Exploration Rate
          </div>
          <div class="text-2xl font-serif font-bold text-primary">
            {{ explorationRate }}%
          </div>
          <div class="text-[10px] text-text-tertiary">
            Visited places index
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-bg-secondary border border-border text-center space-y-0.5">
          <div class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Average Spend
          </div>
          <div class="text-2xl font-serif font-bold text-highlight-strong">
            {{ averagePriceString }}
          </div>
          <div class="text-[10px] text-text-tertiary">
            Average price level
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-bg-secondary border border-border text-center space-y-0.5">
          <div class="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Total Visits
          </div>
          <div class="text-2xl font-serif font-bold text-text-primary">
            {{ totalVisits }}
          </div>
          <div class="text-[10px] text-text-tertiary">
            Total logged visits
          </div>
        </div>
      </div>

      <!-- Spotlight #1 Place -->
      <div v-if="topPick" class="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-primary/10 via-bg-secondary to-bg-secondary border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-highlight text-text-primary text-[10px] font-bold uppercase tracking-wider shadow-xs">
            <Trophy class="w-3.5 h-3.5" />
            <span>Your #1 Undefeated Spot</span>
          </div>
          <h3 class="font-serif font-bold text-xl text-text-primary">
            {{ topPick.name }}
          </h3>
          <p class="text-xs text-text-secondary font-medium">
            {{ topPick.cuisine }} • {{ topPick.area }} • <span class="font-bold text-primary">{{ '£'.repeat(topPick.priceLevel) }}</span>
          </p>
          <p v-if="topPick.specialty" class="text-xs text-text-tertiary italic">
            Must-try dish: "{{ topPick.specialty }}"
          </p>
        </div>
      </div>

      <!-- Foodie Badges & Trophies -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <Award class="w-4 h-4 text-primary" />
          <span>Unlocked Culinary Badges</span>
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            v-for="badge in badges"
            :key="badge.title"
            class="p-3 rounded-2xl border text-center space-y-1 transition-all"
            :class="badge.unlocked ? 'bg-bg-secondary border-primary/40 shadow-xs' : 'bg-bg-secondary/40 border-border opacity-40 grayscale'"
          >
            <div class="text-xl">{{ badge.icon }}</div>
            <div class="text-xs font-bold text-text-primary line-clamp-1">
              {{ badge.title }}
            </div>
            <div class="text-[10px] text-text-tertiary line-clamp-2 leading-tight">
              {{ badge.desc }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cuisines & Neighborhoods Distribution -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Cuisines Breakdown -->
        <div class="p-4 rounded-2xl bg-bg-secondary border border-border space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center justify-between">
            <span>Favorite Cuisines</span>
            <span class="text-[10px] font-normal text-text-tertiary">Click to filter</span>
          </h3>

          <div class="space-y-2.5">
            <div
              v-for="item in cuisineStats.slice(0, 5)"
              :key="item.name"
              @click="filterByCuisine(item.name)"
              class="group cursor-pointer space-y-1"
            >
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-text-primary group-hover:text-primary transition-colors">{{ item.name }}</span>
                <span class="text-text-tertiary">{{ item.count }} ({{ item.percent }}%)</span>
              </div>
              <div class="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                <div
                  class="bg-primary h-full rounded-full transition-all duration-500 group-hover:bg-primary-hover"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Neighborhoods Breakdown -->
        <div class="p-4 rounded-2xl bg-bg-secondary border border-border space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center justify-between">
            <span>Top Neighborhoods</span>
            <span class="text-[10px] font-normal text-text-tertiary">Concentration</span>
          </h3>

          <div class="space-y-2.5">
            <div
              v-for="item in areaStats.slice(0, 5)"
              :key="item.name"
              @click="filterByArea(item.name)"
              class="group cursor-pointer space-y-1"
            >
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-text-primary group-hover:text-primary transition-colors">{{ item.name }}</span>
                <span class="text-text-tertiary">{{ item.count }} places</span>
              </div>
              <div class="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                <div
                  class="bg-highlight-strong h-full rounded-full transition-all duration-500"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
