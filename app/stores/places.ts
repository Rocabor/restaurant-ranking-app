import { defineStore } from 'pinia';
import type { Place, Comparison, FullPlaceJsonData } from '~/types';
import { PlaceSchema } from '~/utils/schemas';
import sampleData from '../../data/sample-places.json';

type Meta = FullPlaceJsonData['meta'];

interface PlacesState {
  meta: Meta | null;
  places: Place[];
  comparisons: Comparison[];
  loading: boolean;
}

export const usePlacesStore = defineStore('places', {
  state: (): PlacesState => ({
    meta: null,
    places: [],
    comparisons: [],
    loading: false,
  }),

  getters: {
    rankedPlaces: (state) =>
      state.places
        .filter((p) => p.status === 'ranked')
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),

    wantToTry: (state) => state.places.filter((p) => p.status === 'want'),

    getPlaceById: (state) => (id: string) => state.places.find((p) => p.id === id),

    totalVisits: (state) => state.places.reduce((sum, p) => sum + p.visits, 0),
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
  },
});
