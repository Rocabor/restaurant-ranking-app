import { defineStore } from 'pinia';

type ModalType = 'decider' | 'stats' | 'share' | 'auth' | 'addPlace' | 'editPlace' | 'search' | null;

interface UIState {
  searchQuery: string;
  isDarkMode: boolean;
  activeModal: ModalType;
  currentUser: { email: string } | null;
  isMenuOpen: boolean;
  isRailOpen: boolean;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    searchQuery: '',
    isDarkMode: false,
    activeModal: null,
    currentUser: null,
    isMenuOpen: false,
    isRailOpen: false,
  }),

  actions: {
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

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle('dark', this.isDarkMode);
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
