import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/icon', '@nuxtjs/supabase'],
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/',
      callback: '/',
      exclude: [],
    },
  },
  icon: {
    serverBundle: 'local',
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Food Journal | Tastemap',
      meta: [{ name: 'description', content: 'Personal London restaurant map with Elo pairwise ranking, curated lists, and taste stats' }],
    },
  },
});
