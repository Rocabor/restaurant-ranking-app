import { defineStore } from 'pinia';

type ModalType = 'decider' | 'stats' | 'share' | 'auth' | 'addPlace' | 'editPlace' | 'duel' | 'search' | null;

interface UIState {
  searchQuery: string;
  isDarkMode: boolean;
  activeModal: ModalType;
  currentUser: { email: string } | null;
  isMenuOpen: boolean;
  isRailOpen: boolean;
  showDetailSheet: boolean;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    searchQuery: '',
    isDarkMode: false,
    activeModal: null,
    currentUser: null,
    isMenuOpen: false,
    isRailOpen: false,
    showDetailSheet: false,
  }),

  actions: {
    initDarkMode() {
      if (typeof window === 'undefined') return;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('tastemap-theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      } else {
        this.isDarkMode = prefersDark;
      }
      document.documentElement.classList.toggle('dark', this.isDarkMode);
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    },

    openModal(type: NonNullable<ModalType>) {
      this.activeModal = type;
    },

    closeModal() {
      this.activeModal = null;
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    closeMenu() {
      this.isMenuOpen = false;
    },

    toggleRail() {
      this.isRailOpen = !this.isRailOpen;
    },

    closeRail() {
      this.isRailOpen = false;
    },

    openDetailSheet() {
      this.showDetailSheet = true;
    },

    closeDetailSheet() {
      this.showDetailSheet = false;
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle('dark', this.isDarkMode);
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      localStorage.setItem('tastemap-theme', this.isDarkMode ? 'dark' : 'light');
    },

    setUser(user: { email: string } | null) {
      this.currentUser = user;
    },

    logoutUser() {
      this.currentUser = null;
      this.activeModal = null;
    },
  },
});
