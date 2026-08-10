import { defineStore } from 'pinia';
import type { Place, Comparison, FullPlaceJsonData } from '~/types';
import { PlaceSchema } from '~/utils/schemas';
import sampleData from '../../data/sample-places.json';

type Meta = FullPlaceJsonData['meta'];
type SortOption = 'rank' | 'name' | 'dateAdded' | 'visits' | 'priceLevel';

interface BinaryInsertionState {
  isPlacing: boolean;
  newPlaceId: string | null;
  low: number;
  high: number;
  mid: number;
  questionCount: number;
  totalEstimate: number;
  currentOpponentId: string | null;
}

interface PlacesState {
  meta: Meta | null;
  places: Place[];
  comparisons: Comparison[];
  loading: boolean;
  sortBy: SortOption;
  selectedStatus: 'all' | 'ranked' | 'want';
  selectedCuisine: string;
  selectedPrice: number | null;
  selectedArea: string | null;
  selectedTag: string | null;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  editingPlace: Place | null;
  binaryInsertion: BinaryInsertionState;
  searchQuery: string;
}

export const usePlacesStore = defineStore('places', {
  state: (): PlacesState => ({
    meta: null,
    places: [],
    comparisons: [],
    loading: false,
    sortBy: 'rank',
    selectedStatus: 'all',
    selectedCuisine: 'all',
    selectedPrice: null,
    selectedArea: null,
    selectedTag: null,
    selectedPlaceId: null,
    hoveredPlaceId: null,
    editingPlace: null,
    binaryInsertion: {
      isPlacing: false,
      newPlaceId: null,
      low: 0,
      high: 0,
      mid: 0,
      questionCount: 0,
      totalEstimate: 0,
      currentOpponentId: null,
    },
    searchQuery: '',
  }),

  getters: {
    rankedPlaces: (state) =>
      state.places
        .filter((p) => p.status === 'ranked')
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),

    wantToTry: (state) => state.places.filter((p) => p.status === 'want'),

    getPlaceById: (state) => (id: string) => state.places.find((p) => p.id === id),

    selectedPlace: (state) => state.places.find((p) => p.id === state.selectedPlaceId) || null,

    totalVisits: (state) => state.places.reduce((sum, p) => sum + p.visits, 0),

    allCuisines: (state) => {
      const cuisines = new Set(state.places.map((p) => p.cuisine).filter(Boolean));
      return Array.from(cuisines).sort();
    },

    allAreas: (state) => {
      const areas = new Set(state.places.map((p) => p.area).filter(Boolean));
      return Array.from(areas).sort();
    },

    allTags: (state) => {
      const tags = new Set(state.places.flatMap((p) => p.tags || []));
      return Array.from(tags).sort();
    },

    filteredPlaces: (state) => {
      let result = [...state.places];

      if (state.selectedStatus === 'ranked') {
        result = result.filter((p) => p.status === 'ranked');
      } else if (state.selectedStatus === 'want') {
        result = result.filter((p) => p.status === 'want');
      }

      if (state.selectedCuisine !== 'all') {
        result = result.filter((p) => p.cuisine === state.selectedCuisine);
      }

      if (state.selectedPrice !== null) {
        result = result.filter((p) => p.priceLevel === state.selectedPrice);
      }

      if (state.selectedArea) {
        result = result.filter((p) => p.area === state.selectedArea);
      }

      if (state.selectedTag) {
        result = result.filter((p) => p.tags?.includes(state.selectedTag!));
      }

      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim();
        result = result.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.cuisine.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
        );
      }

      // Apply sorting
      switch (state.sortBy) {
        case 'rank':
          result.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'dateAdded':
          result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
          break;
        case 'visits':
          result.sort((a, b) => b.visits - a.visits);
          break;
        case 'priceLevel':
          result.sort((a, b) => a.priceLevel - b.priceLevel);
          break;
      }

      return result;
    },
  },

  actions: {
    loadData() {
      this.loading = true;
      // Simulate async load for demo
      setTimeout(() => {
        const result = PlaceSchema.safeParse(sampleData);
        if (result.success) {
          this.meta = result.data.meta;
          this.places = result.data.places;
          this.comparisons = result.data.comparisons;
        } else {
          console.error('Invalid sample data:', result.error);
        }
        this.loading = false;
      }, 500);
    },

    addPlace(place: Place) {
      this.places.push(place);
    },

    updatePlace(id: string, updates: Partial<Omit<Place, 'id'>>) {
      const index = this.places.findIndex((p) => p.id === id);
      if (index !== -1) {
        const current = this.places[index];
        const filtered = Object.fromEntries(
          Object.entries(updates).filter(([, v]) => v !== undefined),
        ) as Partial<Omit<Place, 'id'>>;
        this.places[index] = { ...current, ...filtered } as Place;
      }
    },

    removePlace(id: string) {
      this.places = this.places.filter((p) => p.id !== id);
    },

    addComparison(comparison: Comparison) {
      this.comparisons.push(comparison);
    },

    clearFilters() {
      this.selectedStatus = 'all';
      this.selectedCuisine = 'all';
      this.selectedPrice = null;
      this.selectedArea = null;
      this.selectedTag = null;
      this.searchQuery = '';
    },

    selectPlace(id: string) {
      this.selectedPlaceId = id;
    },

    startEditingPlace(place: Place) {
      this.editingPlace = place;
    },

    clearEditingPlace() {
      this.editingPlace = null;
    },

    setHoveredPlace(id: string | null) {
      this.hoveredPlaceId = id;
    },

    togglePlaceStatus(id: string, openDuelModal?: () => void) {
      const place = this.places.find(p => p.id === id);
      if (!place) return;

      if (place.status === 'want') {
        place.status = 'ranked';
        place.visits = 1;
        this.startBinaryInsertion(id);
        if (openDuelModal && this.rankedPlaces.length > 1) {
          openDuelModal();
        }
      } else {
        place.status = 'want';
        place.rank = null;
        place.visits = 0;
        this.recalculateRanks();
      }
    },

    startBinaryInsertion(newPlaceId: string) {
      const rankedPlaces = this.rankedPlaces.filter(p => p.id !== newPlaceId);
      const n = rankedPlaces.length;

      if (n === 0) {
        const place = this.places.find(p => p.id === newPlaceId);
        if (place) {
          place.rank = 1;
        }
        this.recalculateRanks();
        this.binaryInsertion = {
          isPlacing: false,
          newPlaceId: null,
          low: 0,
          high: 0,
          mid: 0,
          questionCount: 0,
          totalEstimate: 0,
          currentOpponentId: null,
        };
        return;
      }

      if (n === 1) {
        this.binaryInsertion = {
          isPlacing: true,
          newPlaceId,
          low: 0,
          high: 0,
          mid: 0,
          questionCount: 1,
          totalEstimate: 1,
          currentOpponentId: rankedPlaces[0].id,
        };
        return;
      }

      const totalEstimate = Math.ceil(Math.log2(n + 1));
      const low = 0;
      const high = n - 1;
      const mid = Math.floor((low + high) / 2);

      this.binaryInsertion = {
        isPlacing: true,
        newPlaceId,
        low,
        high,
        mid,
        questionCount: 1,
        totalEstimate,
        currentOpponentId: rankedPlaces[mid].id,
      };
    },

    handleBinaryInsertionChoice(choice: 'new' | 'existing' | 'tie') {
      const { newPlaceId, low, high, mid, questionCount } = this.binaryInsertion;
      if (!newPlaceId) return;

      const rankedPlaces = this.rankedPlaces.filter(p => p.id !== newPlaceId);
      const newPlace = this.places.find(p => p.id === newPlaceId);
      if (!newPlace) return;

      const comparison: Comparison = {
        aId: newPlaceId,
        bId: rankedPlaces[mid]?.id || this.binaryInsertion.currentOpponentId!,
        result: choice === 'tie' ? 'tie' : choice === 'new' ? 'a' : 'b',
        date: new Date().toISOString()
      };
      this.comparisons.push(comparison);

      if (choice === 'tie') {
        this.finishBinaryInsertion(newPlaceId, mid + 1);
        return;
      }

      if (choice === 'new') {
        if (low >= mid) {
          this.finishBinaryInsertion(newPlaceId, mid);
          return;
        }
        this.binaryInsertion.high = mid - 1;
      } else {
        if (mid >= high) {
          this.finishBinaryInsertion(newPlaceId, mid + 1);
          return;
        }
        this.binaryInsertion.low = mid + 1;
      }

      const newLow = this.binaryInsertion.low;
      const newHigh = this.binaryInsertion.high;

      if (newLow > newHigh) {
        this.finishBinaryInsertion(newPlaceId, newLow);
        return;
      }

      const newMid = Math.floor((newLow + newHigh) / 2);
      this.binaryInsertion.mid = newMid;
      this.binaryInsertion.questionCount = questionCount + 1;
      this.binaryInsertion.currentOpponentId = rankedPlaces[newMid].id;
    },

    finishBinaryInsertion(newPlaceId: string, insertAtRank: number) {
      const newPlace = this.places.find(p => p.id === newPlaceId);
      if (!newPlace) return;

      newPlace.rank = insertAtRank + 1;
      this.recalculateRanks();

      this.binaryInsertion = {
        isPlacing: false,
        newPlaceId: null,
        low: 0,
        high: 0,
        mid: 0,
        questionCount: 0,
        totalEstimate: 0,
        currentOpponentId: null,
      };
    },

    recalculateRanks() {
      const ranked = this.places
        .filter(p => p.status === 'ranked')
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

      ranked.forEach((place, index) => {
        place.rank = index + 1;
      });
    },
  },
});
