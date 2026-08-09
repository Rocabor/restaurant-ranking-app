import { defineStore } from 'pinia';
import type { Place, Comparison, FullPlaceJsonData } from '~/types';
import { PlaceSchema } from '~/utils/schemas';
import sampleData from '../../data/sample-places.json';

type Meta = FullPlaceJsonData['meta'];
type SortOption = 'rank' | 'name' | 'dateAdded' | 'visits' | 'priceLevel';

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
  }),

  getters: {
    rankedPlaces: (state) =>
      state.places
        .filter((p) => p.status === 'ranked')
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),

    wantToTry: (state) => state.places.filter((p) => p.status === 'want'),

    getPlaceById: (state) => (id: string) => state.places.find((p) => p.id === id),

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
      const result = PlaceSchema.safeParse(sampleData);
      if (result.success) {
        this.meta = result.data.meta;
        this.places = result.data.places;
        this.comparisons = result.data.comparisons;
      } else {
        console.error('Invalid sample data:', result.error);
      }
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
    },

    selectPlace(id: string) {
      this.selectedPlaceId = id;
    },

    setHoveredPlace(id: string | null) {
      this.hoveredPlaceId = id;
    },
  },
});
