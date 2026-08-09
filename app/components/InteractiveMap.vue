<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import L from 'leaflet';
import { Compass, Navigation } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
const markersMap = new Map<string, L.Marker>();

const isLocating = ref(false);

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

if (typeof window !== 'undefined') {
  (window as any).tastemapOpenPlace = (id: string) => {
    store.selectPlace(id);
  };
  (window as any).tastemapSharePlace = (id: string) => {
    store.selectedPlaceId = id;
    ui.openModal('share');
  };
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([51.5155, -0.098], 12);

  L.control.attribution({ position: 'bottomleft' }).addTo(map);

  const tileUrl = ui.isDarkMode ? DARK_TILES : LIGHT_TILES;
  tileLayer = L.tileLayer(tileUrl, { attribution: ATTR, maxZoom: 19 }).addTo(map);

  updateMarkers();

  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (map) {
    map.remove();
    map = null;
  }
});

function onResize() {
  if (map) {
    map.invalidateSize();
  }
}

watch(() => ui.isDarkMode, (isDark) => {
  if (tileLayer && map) {
    map.removeLayer(tileLayer);
    const tileUrl = isDark ? DARK_TILES : LIGHT_TILES;
    tileLayer = L.tileLayer(tileUrl, { attribution: ATTR, maxZoom: 19 }).addTo(map);
  }
});

watch(() => store.filteredPlaces, () => {
  updateMarkers();
}, { deep: true });

watch(() => store.selectedPlaceId, (id) => {
  if (!id || !map) return;
  const marker = markersMap.get(id);
  if (marker) {
    const latLng = marker.getLatLng();
    map.panTo(latLng, { animate: true, duration: 0.5 });
    marker.openPopup();
  }
  highlightMarker(id);
});

watch(() => store.hoveredPlaceId, (id) => {
  highlightMarker(id || store.selectedPlaceId);
});

function highlightMarker(activeId: string | null) {
  markersMap.forEach((marker, id) => {
    const el = marker.getElement();
    if (el) {
      if (id === activeId) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    }
  });
}

function updateMarkers() {
  if (!map) return;

  markersMap.forEach(m => m.remove());
  markersMap.clear();

  const bounds = L.latLngBounds([]);

  store.filteredPlaces.forEach(place => {
    if (!place.lat || !place.lng) return;

    const latLng: [number, number] = [place.lat, place.lng];
    bounds.extend(latLng);

    const isRanked = place.status === 'ranked' && place.rank !== null;
    const isTopPick = isRanked && place.rank === 1;

    const pinClass = isTopPick
      ? 'tastemap-pin-inner tastemap-pin-top bg-emerald-600 text-white'
      : isRanked
        ? 'tastemap-pin-inner bg-emerald-600 text-white'
        : 'tastemap-pin-inner bg-amber-500 text-white';

    const innerContent = isRanked
      ? `<span class="tastemap-pin-num">${place.rank}</span>`
      : `<span class="tastemap-pin-num">★</span>`;

    const iconHtml = `<div class="tastemap-pin"><div class="${pinClass}">${innerContent}</div></div>`;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'tastemap-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    const marker = L.marker(latLng, { icon: customIcon }).addTo(map!);

    const priceString = '£'.repeat(place.priceLevel);
    const popupHtml = `
      <div class="p-3.5 space-y-2 text-xs min-w-[210px] max-w-[250px] font-sans">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            isRanked
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-amber-600 border border-gray-200 dark:border-gray-700'
          }">
            ${isRanked ? `#${place.rank} in Ranking` : '★ Want to Try'}
          </span>
          <span class="font-bold text-emerald-600 text-xs">${priceString}</span>
        </div>

        <div>
          <h4 class="font-serif font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">${place.name}</h4>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">${place.cuisine} • ${place.area}</p>
        </div>

        ${place.specialty ? `
          <div class="text-[11px] text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 line-clamp-2">
            ⭐ "${place.specialty}"
          </div>
        ` : ''}

        <div class="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-1.5">
          <button
            onclick="window.tastemapOpenPlace('${place.id}')"
            class="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold text-center transition-all shadow-sm active:scale-95"
          >
            View Details
          </button>
          <button
            onclick="window.tastemapSharePlace('${place.id}')"
            class="py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-gray-200 dark:border-gray-700 text-[11px] font-bold text-center transition-all active:scale-95"
            title="Share on Social Media"
          >
            📲
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: false,
      offset: [0, -28],
      autoPanPadding: [20, 20]
    });

    marker.on('click', () => {
      marker.openPopup();
      highlightMarker(place.id);
    });

    marker.on('mouseover', () => {
      store.setHoveredPlace(place.id);
    });

    marker.on('mouseout', () => {
      store.setHoveredPlace(null);
    });

    markersMap.set(place.id, marker);
  });

  if (store.filteredPlaces.length > 0 && bounds.isValid()) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
}

function fitAllPins() {
  if (!map || store.filteredPlaces.length === 0) return;
  const bounds = L.latLngBounds([]);
  store.filteredPlaces.forEach(p => {
    if (p.lat && p.lng) bounds.extend([p.lat, p.lng]);
  });
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }
}

function locateUser() {
  if (!navigator.geolocation || !map) return;
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false;
      const { latitude, longitude } = pos.coords;
      map?.setView([latitude, longitude], 14, { animate: true });
    },
    () => {
      isLocating.value = false;
      alert('Could not access your location.');
    },
    { timeout: 8000 }
  );
}
</script>

<template>
  <div class="relative w-full h-full min-h-87.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
    <div ref="mapContainer" class="w-full h-full z-10"></div>

    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <button
        @click="fitAllPins"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
        title="View all places"
      >
        <Compass class="w-4 h-4" />
      </button>

      <button
        @click="locateUser"
        :disabled="isLocating"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        title="Center on my location"
      >
        <Navigation class="w-4 h-4" :class="{ 'animate-spin': isLocating }" />
      </button>
    </div>

    <div class="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-md text-xs font-medium flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
        <span class="text-gray-500 dark:text-gray-400">Visited (Rank No.)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
        <span class="text-gray-500 dark:text-gray-400">Want to try</span>
      </div>
    </div>
  </div>
</template>
