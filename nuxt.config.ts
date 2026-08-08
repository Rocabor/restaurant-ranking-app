import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Tastemap - London Food Map',
      meta: [{ name: 'description', content: 'Personal London restaurant map with Elo pairwise ranking, curated lists, and taste stats' }],
    },
  },
});
