 <!--* app\components\ShareModal.vue  -->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import { Share2, X, Copy, CheckCircle2, Smartphone } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();

const selectedPlaceId = ref<string>('');
const notification = ref<string | null>(null);
const supportsNativeShare = ref(false);

onMounted(() => {
  supportsNativeShare.value = typeof navigator !== 'undefined' && !!navigator.share;
});

watch(() => ui.activeModal, (val) => {
  if (val === 'share') {
    if (store.selectedPlaceId) {
      selectedPlaceId.value = store.selectedPlaceId;
    } else if (store.places.length > 0) {
      selectedPlaceId.value = store.places[0]?.id ?? '';
    }
    notification.value = null;
  }
});

const cardPlace = computed(() => {
  return store.places.find(p => p.id === selectedPlaceId.value) || store.places[0] || null;
});

const appUrl = computed(() => {
  return typeof window !== 'undefined' ? window.location.href : 'https://tastemap.app';
});

function buildShareText(): string {
  if (!cardPlace.value) return '';
  const p = cardPlace.value;

  let text = `🍽️ FOOD RECOMMENDATION ON TASTEMAP!\n\n`;
  text += `📍 ${p.name.toUpperCase()}\n`;
  text += `• Status: ${p.status === 'ranked' ? `Rank #${p.rank} on Ranking` : '★ Want to try'}\n`;
  text += `• Cuisine: ${p.cuisine} | Neighborhood: ${p.area}\n`;
  text += `• Price: ${'£'.repeat(p.priceLevel)}\n`;

  if (p.specialty) {
    text += `\n⭐ Recommended Dish:\n"${p.specialty}"\n`;
  }

  if (p.note) {
    text += `\n📝 Review:\n"${p.note}"\n`;
  }

  text += `\n✨ Discover this place and more on Tastemap`;
  return text;
}

function showNotification(msg: string) {
  notification.value = msg;
  setTimeout(() => {
    if (notification.value === msg) {
      notification.value = null;
    }
  }, 3500);
}

function shareToWhatsApp() {
  const text = encodeURIComponent(buildShareText() + `\n${appUrl.value}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  showNotification('Opening WhatsApp...');
}

function shareToTelegram() {
  const text = encodeURIComponent(buildShareText());
  const url = encodeURIComponent(appUrl.value);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  showNotification('Opening Telegram...');
}

function shareToX() {
  if (!cardPlace.value) return;
  const p = cardPlace.value;
  const tweet = `🍽️ Recommendation: ${p.name} (${p.cuisine} in ${p.area}). ${p.specialty ? `Must try: ${p.specialty}.` : ''} #Tastemap #Foodie`;
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(appUrl.value)}`, '_blank');
  showNotification('Opening X (Twitter)...');
}

function shareToFacebook() {
  const url = encodeURIComponent(appUrl.value);
  const quote = encodeURIComponent(buildShareText());
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  showNotification('Opening Facebook...');
}

function copyForInstagram() {
  if (!cardPlace.value) return;
  const p = cardPlace.value;
  let text = `✨ ${p.name.toUpperCase()} ✨\n`;
  text += `📍 ${p.area} | ${p.cuisine}\n`;
  if (p.status === 'ranked') text += `🏆 Rank #${p.rank} of my favorites\n`;
  if (p.specialty) text += `⭐ Star dish: ${p.specialty}\n`;
  if (p.note) text += `📝 "${p.note}"\n`;
  text += `\n#Foodie #${p.cuisine.replace(/\s+/g, '')} #Food #Tastemap #${p.name.replace(/\s+/g, '')}`;

  navigator.clipboard.writeText(text);
  showNotification('Instagram text copied! Open Instagram and paste it in your Story or DM.');
}

function copyForDiscord() {
  if (!cardPlace.value) return;
  const p = cardPlace.value;
  let text = `>>> 🍽️ **Food Recommendation: ${p.name}**\n`;
  text += `**Cuisine:** ${p.cuisine} | **Neighborhood:** ${p.area}\n`;
  text += `**Rank:** ${p.status === 'ranked' ? `#${p.rank} on Ranking` : '★ Want to try'} | **Price:** ${'£'.repeat(p.priceLevel)}\n`;
  if (p.specialty) text += `⭐ **Star Dish:** ${p.specialty}\n`;
  if (p.note) text += `📝 *"${p.note}"*\n`;

  navigator.clipboard.writeText(text);
  showNotification('Markdown message copied for Discord!');
}

function copyFullText() {
  const text = buildShareText();
  navigator.clipboard.writeText(text);
  showNotification('Card copied to clipboard!');
}

function triggerNativeShare() {
  if (!navigator.share || !cardPlace.value) return;
  navigator.share({
    title: `${cardPlace.value.name} Card — Tastemap`,
    text: buildShareText(),
    url: appUrl.value
  }).catch(() => {});
}
</script>

<template>
  <div
    v-if="ui.activeModal === 'share'"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-title"
  >
    <div class="relative w-full max-w-md max-h-[92vh] bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 overflow-y-auto scrollbar-thin my-auto animate-fade-in">

      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div class="flex items-center gap-2.5">
          <div class="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Share2 class="w-5 h-5" />
          </div>
          <div>
            <h2 id="share-title" class="font-serif font-bold text-xl text-text-primary">
              Share on Social Media
            </h2>
            <p class="text-xs text-text-tertiary font-medium">
              Send this restaurant's card directly to your groups and followers
            </p>
          </div>
        </div>

        <button
          @click="ui.closeModal()"
          class="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Select Place Dropdown -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
          Restaurant to Share
        </label>
        <select
          v-model="selectedPlaceId"
          class="w-full px-3.5 py-2.5 text-xs bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-medium cursor-pointer"
        >
          <option v-for="p in store.places" :key="p.id" :value="p.id">
            {{ p.status === 'ranked' ? `#${p.rank}` : '★' }} {{ p.name }} ({{ p.cuisine }} • {{ p.area }})
          </option>
        </select>
      </div>

      <!-- Live Card Preview -->
      <div v-if="cardPlace" class="p-4 rounded-2xl bg-bg-secondary border border-border space-y-3 shadow-inner relative overflow-hidden">

        <!-- Header Info -->
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide"
              :class="cardPlace.status === 'ranked' ? 'bg-primary text-white' : 'bg-highlight/10 text-highlight-strong border border-highlight'"
            >
              {{ cardPlace.status === 'ranked' ? `Rank #${cardPlace.rank} in Ranking` : '★ Want to try' }}
            </span>
            <span class="text-xs font-bold text-primary">
              {{ '£'.repeat(cardPlace.priceLevel) }}
            </span>
          </div>
          <span class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
            Card Preview
          </span>
        </div>

        <div class="space-y-1">
          <h3 class="font-serif font-bold text-xl text-text-primary">
            {{ cardPlace.name }}
          </h3>
          <p class="text-xs text-text-secondary font-medium">
            📍 {{ cardPlace.area }} {{ cardPlace.address ? `— ${cardPlace.address}` : '' }}
          </p>
          <p class="text-xs text-primary font-semibold">
            🍽️ Cuisine: {{ cardPlace.cuisine }}
          </p>
        </div>

        <div v-if="cardPlace.specialty" class="p-2.5 rounded-xl bg-surface border border-border text-xs text-text-secondary italic">
          ⭐ <strong>Recommended Dish:</strong> "{{ cardPlace.specialty }}"
        </div>

        <div v-if="cardPlace.note" class="text-xs text-text-secondary leading-relaxed">
          📝 <strong>Review:</strong> "{{ cardPlace.note }}"
        </div>
      </div>

      <!-- Toast Notification -->
      <div
        v-if="notification"
        class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fade-in"
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span>{{ notification }}</span>
        </div>
        <button @click="notification = null" class="opacity-60 hover:opacity-100" aria-label="Dismiss notification">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Social Share Grid -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Choose Social Network or App
        </label>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            @click="shareToWhatsApp"
            class="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="ic:baseline-whatsapp" size="16px"/>
            <span>WhatsApp</span>
          </button>

          <button
            @click="shareToTelegram"
            class="p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="ic:baseline-telegram" size="16px"/>
            <span>Telegram</span>
          </button>

          <button
            @click="shareToX"
            class="p-3 rounded-2xl bg-black/10 dark:bg-white/10 hover:bg-black dark:hover:bg-white text-text-primary hover:text-white dark:hover:text-black border border-border font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="line-md:twitter-x" size="16px"/>
            <span>/ Twitter</span>
          </button>

          <button
            @click="shareToFacebook"
            class="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="ic:baseline-facebook" size="16px"/>
            <span>Facebook</span>
          </button>

          <button
            @click="copyForInstagram"
            class="p-3 rounded-2xl bg-linear-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#FCB045]/10 hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCB045] text-[#E1306C] hover:text-white border border-[#E1306C]/30 font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="mdi:instagram" size="16px"/>
            <span>Instagram</span>
          </button>

          <button
            @click="copyForDiscord"
            class="p-3 rounded-2xl bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white border border-[#5865F2]/30 font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Icon name="ic:baseline-discord" size="16px"/>
            <span>Discord</span>
          </button>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          @click="copyFullText"
          class="py-2.5 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Copy class="w-4 h-4" />
          <span>Copy Full Text</span>
        </button>

        <button
          v-if="supportsNativeShare"
          @click="triggerNativeShare"
          class="py-2.5 px-4 rounded-xl text-xs font-bold bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-primary transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Smartphone class="w-4 h-4 text-primary" />
          <span>Native Mobile Menu</span>
        </button>
      </div>
    </div>
  </div>
</template>

