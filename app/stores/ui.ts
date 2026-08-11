import { defineStore } from 'pinia';

type ModalType = 'decider' | 'stats' | 'auth' | 'addPlace' | 'editPlace' | 'duel' | 'search' | 'confirm' | null;
type MobileView = 'map' | 'list';

interface ConfirmModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm?: () => void;
}

export interface PlacePrefill {
  name?: string;
  cuisine?: string;
  specialty?: string;
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  status?: 'want' | 'ranked';
  note?: string;
  tags?: string;
  website?: string;
}

interface UIState {
  isDarkMode: boolean;
  activeModal: ModalType;
  currentUser: { email: string } | null;
  isMenuOpen: boolean;
  isRailOpen: boolean;
  showDetailSheet: boolean;
  showLanding: boolean;
  confirmData: ConfirmModalData | null;
  mobileView: MobileView;
  placePrefill: PlacePrefill | null;
  focusCoordinates: { lat: number; lng: number } | null;
  pinPickActive: boolean;
  pinPickCoords: { lat: number; lng: number } | null;
  pinPickReopen: 'addPlace' | 'editPlace' | null;
  pendingPinCoords: { lat: number; lng: number } | null;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isDarkMode: false,
    activeModal: null,
    currentUser: null,
    isMenuOpen: false,
    isRailOpen: false,
    showDetailSheet: false,
    showLanding: true,
    confirmData: null,
    mobileView: 'map',
    placePrefill: null,
    focusCoordinates: null,
    pinPickActive: false,
    pinPickCoords: null,
    pinPickReopen: null,
    pendingPinCoords: null,
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

    hideLanding() {
      this.showLanding = false;
    },

    showLandingPage() {
      this.showLanding = true;
      this.activeModal = null;
      this.showDetailSheet = false;
    },

    showConfirm(data: ConfirmModalData) {
      this.confirmData = data;
      this.activeModal = 'confirm';
    },

    closeConfirm() {
      this.confirmData = null;
      this.activeModal = null;
    },

    toggleMobileView() {
      this.mobileView = this.mobileView === 'map' ? 'list' : 'map';
    },

    setMobileView(view: MobileView) {
      this.mobileView = view;
    },

    prefillPlace(data: PlacePrefill) {
      this.placePrefill = data;
      this.openModal('addPlace');
    },

    panToCoordinates(lat: number, lng: number) {
      this.focusCoordinates = { lat, lng };
    },

    clearFocusCoordinates() {
      this.focusCoordinates = null;
    },

    startPinPick(reopen: 'addPlace' | 'editPlace') {
      this.pinPickActive = true;
      this.pinPickCoords = null;
      this.pinPickReopen = reopen;
      this.activeModal = null;
      this.showDetailSheet = false;
      this.setMobileView('map');
    },

    setPinPickCoords(lat: number, lng: number) {
      this.pinPickCoords = { lat, lng };
    },

    confirmPinPick() {
      if (this.pinPickCoords) {
        this.pendingPinCoords = { ...this.pinPickCoords };
      }
      const reopen = this.pinPickReopen || 'addPlace';
      this.pinPickActive = false;
      this.pinPickCoords = null;
      this.pinPickReopen = null;
      this.openModal(reopen);
    },

    cancelPinPick() {
      this.pinPickActive = false;
      this.pinPickCoords = null;
      this.pinPickReopen = null;
    },
  },
});
