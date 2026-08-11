<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import type { Place } from '~/types';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Compass, Navigation, MapPin, Plus, Minus } from '@lucide/vue';

const store = usePlacesStore();
const ui = useUIStore();
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let markerClusterGroup: L.MarkerClusterGroup | null = null;
const markersMap = new Map<string, L.Marker>();

let pinPickMarker: L.Marker | null = null;
let pinPickClickHandler: ((e: L.LeafletMouseEvent) => void) | null = null;

const isLocating = ref(false);

function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function reduceMotionActive(): boolean {
  return prefersReducedMotion();
}

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function handlePlaceAction(action: 'open' | 'duel', id: string) {
  const place = store.places.find(p => p.id === id);
  if (!place) return;
  if (action === 'open') {
    store.selectPlace(id);
    ui.openDetailSheet();
  } else if (action === 'duel') {
    if (place.status === 'want') {
      store.togglePlaceStatus(id, () => ui.openModal('duel'));
    } else {
      store.startBinaryInsertion(id);
      ui.openModal('duel');
    }
  }
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([20, 0], 2);

  L.control.attribution({ position: 'bottomleft' }).addTo(map);

  const tileUrl = ui.isDarkMode ? DARK_TILES : LIGHT_TILES;
  tileLayer = L.tileLayer(tileUrl, { attribution: ATTR, maxZoom: 19 }).addTo(map);

  markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div class="tastemap-cluster"><span>${count}</span></div>`,
        className: 'tastemap-cluster-wrapper',
        iconSize: [40, 40]
      });
    }
  });
  map.addLayer(markerClusterGroup);

  updateMarkers();

  mapContainer.value.addEventListener('click', onPopupAction);
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('click', onPopupAction);
  }
  window.removeEventListener('resize', onResize);
  if (markerClusterGroup) {
    markerClusterGroup.clearLayers();
  }
  if (map) {
    map.remove();
    map = null;
  }
});

function onPopupAction(e: MouseEvent) {
  if (ui.pinPickActive) return;
  const target = (e.target as HTMLElement).closest('[data-tastemap-action]') as HTMLElement | null;
  if (!target) return;
  const action = target.dataset.tastemapAction as 'open' | 'duel';
  const id = target.dataset.placeId;
  if (action && id) {
    handlePlaceAction(action, id);
  }
}

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
  updateMarkers();
});

watch(() => store.filteredPlaces, () => {
  updateMarkers();
}, { deep: true });

watch(() => store.selectedPlaceId, (id) => {
  if (!map) return;
  if (!id) {
    highlightMarker(null);
    return;
  }
  const marker = markersMap.get(id);
  if (marker) {
    const latLng = marker.getLatLng();
    map.stop();
    map.setView(latLng, Math.max(map.getZoom(), 15), { animate: !reduceMotionActive() });
    highlightMarker(id);
  }
});

watch(() => store.hoveredPlaceId, (id) => {
  highlightMarker(id || store.selectedPlaceId);
});

watch(() => ui.focusCoordinates, (coords) => {
  if (!map || !coords) return;
  map.stop();
  map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 14), { animate: !reduceMotionActive() });
  ui.clearFocusCoordinates();
});

watch(() => ui.pinPickActive, (active) => {
  if (!map) return;
  if (active) {
    map.getContainer().style.cursor = 'crosshair';
    pinPickClickHandler = (e: L.LeafletMouseEvent) => placePinPickMarker(e.latlng.lat, e.latlng.lng);
    map.on('click', pinPickClickHandler);
  } else {
    map.getContainer().style.cursor = '';
    if (pinPickClickHandler) {
      map.off('click', pinPickClickHandler);
      pinPickClickHandler = null;
    }
    if (pinPickMarker) {
      map.removeLayer(pinPickMarker);
      pinPickMarker = null;
    }
  }
});

function createMarkerIcon(place: Place, isSelected: boolean) {
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
  const wrapperClass = `tastemap-marker-wrapper${isSelected ? ' is-active' : ''}`;

  return L.divIcon({
    html: iconHtml,
    className: wrapperClass,
    iconSize: [36, 44],
    iconAnchor: [18, 44]
  });
}

function createPopupHtml(place: Place) {
  const isRanked = place.status === 'ranked' && place.rank !== null;
  const priceString = '£'.repeat(place.priceLevel);
  const isDark = ui.isDarkMode;

  const name = escapeHtml(place.name);
  const cuisine = escapeHtml(place.cuisine);
  const area = escapeHtml(place.area);
  const address = escapeHtml(place.address);
  const specialty = escapeHtml(place.specialty);
  const id = escapeHtml(place.id);

  const bg = isDark ? '#1c1917' : '#ffffff';
  const bgSecondary = isDark ? '#292524' : '#f5f5f4';
  const textPrimary = isDark ? '#fafaf9' : '#1c1917';
  const textSecondary = isDark ? '#a8a29e' : '#57534e';
  const textTertiary = isDark ? '#78716c' : '#a8a29e';
  const border = isDark ? '#44403c' : '#e7e5e4';
  const primary = isDark ? '#34d399' : '#059669';
  const amber = isDark ? '#fbbf24' : '#d97706';
  const amberBg = isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.08)';

  return `
    <div class="tastemap-popup" style="padding:14px;min-width:220px;max-width:260px;font-family:'Switzer',system-ui,sans-serif;background:${bg};color:${textPrimary};border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,${isDark ? '0.5' : '0.12'});">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;${isRanked ? `background:${primary};color:#fff;` : `background:${amberBg};color:${amber};border:1px solid ${border};`}">
          ${isRanked ? `#${place.rank} Ranked` : '★ Want to Try'}
        </span>
        <span style="font-weight:700;font-size:12px;color:${primary};">${priceString}</span>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-family:'Bespoke Serif',Georgia,serif;font-weight:700;font-size:15px;line-height:1.2;color:${textPrimary};margin-bottom:2px;">${name}</div>
        <div style="font-size:11px;color:${textSecondary};font-weight:500;">${cuisine} • ${area}</div>
      </div>

      ${place.specialty ? `
        <div style="padding:8px 10px;border-radius:10px;background:${bgSecondary};border:1px solid ${border};margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${textTertiary};margin-bottom:2px;">⭐ Signature Dish</div>
          <div style="font-size:11px;color:${textSecondary};font-style:italic;line-height:1.4;">&quot;${specialty}&quot;</div>
        </div>
      ` : ''}

      <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid ${border};">
        <button data-tastemap-action="open" data-place-id="${id}"
          class="tastemap-popup-btn tastemap-popup-btn-primary"
          style="flex:1;padding:8px 10px;border-radius:10px;background:${primary};color:#fff;border:none;font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;box-shadow:0 2px 8px ${primary}33;">
          View Details
        </button>
        <button data-tastemap-action="duel" data-place-id="${id}"
          class="tastemap-popup-btn"
          style="padding:8px 10px;border-radius:10px;background:${bgSecondary};color:${textPrimary};border:1px solid ${border};font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;"
          aria-label="Compare ${name} in a duel">
          ⚔️
        </button>
      </div>
    </div>
  `;
}

function highlightMarker(activeId: string | null) {
  markersMap.forEach((marker, id) => {
    const place = store.places.find(p => p.id === id);
    if (!place) return;
    marker.setIcon(createMarkerIcon(place, id === activeId));
  });
}

function updateMarkers() {
  if (!map || !markerClusterGroup) return;
  const cluster = markerClusterGroup;

  cluster.clearLayers();
  markersMap.clear();

  const bounds = L.latLngBounds([]);

  store.filteredPlaces.forEach(place => {
    if (!place.lat || !place.lng) return;

    const latLng: [number, number] = [place.lat, place.lng];
    bounds.extend(latLng);

    const isSelected = store.selectedPlaceId === place.id;
    const customIcon = createMarkerIcon(place, isSelected);

    const marker = L.marker(latLng, {
      icon: customIcon,
      keyboard: true,
      title: `${place.name}, ${place.cuisine}, ${place.area}, ${place.status === 'ranked' ? `ranked #${place.rank}` : 'want to try'}`
    });

    marker.bindPopup(createPopupHtml(place), {
      closeButton: false,
      offset: [0, -28],
      autoPanPadding: [20, 20]
    });

    marker.on('click', () => {
      if (ui.pinPickActive) {
        map?.closePopup();
        return;
      }
      store.selectPlace(place.id);
      marker.openPopup();
    });

    marker.on('mouseover', () => {
      store.setHoveredPlace(place.id);
    });

    marker.on('mouseout', () => {
      store.setHoveredPlace(null);
    });

    markersMap.set(place.id, marker);
    cluster.addLayer(marker);
  });

  if (store.filteredPlaces.length > 0 && bounds.isValid()) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }

  if (store.selectedPlaceId) {
    const selectedMarker = markersMap.get(store.selectedPlaceId);
    if (selectedMarker) {
      map.panTo(selectedMarker.getLatLng(), { animate: !reduceMotionActive() });
    }
  }
}

function placePinPickMarker(lat: number, lng: number) {
  if (!map) return;
  map.closePopup();
  const latLng: [number, number] = [lat, lng];
  if (pinPickMarker) {
    pinPickMarker.setLatLng(latLng);
  } else {
    pinPickMarker = L.marker(latLng, {
      icon: L.divIcon({
        html: '<div class="tastemap-pin"><div class="tastemap-pin-inner tastemap-pin-pick bg-primary text-white"><span class="tastemap-pin-num">●</span></div></div>',
        className: 'tastemap-marker-wrapper is-active',
        iconSize: [36, 44],
        iconAnchor: [18, 44]
      }),
      keyboard: false
    });
    pinPickMarker.addTo(map);
  }
  ui.setPinPickCoords(lat, lng);
}

function fitAllPins() {  if (!map || store.filteredPlaces.length === 0) return;
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
      map?.setView([latitude, longitude], 14, { animate: !reduceMotionActive() });
    },
    () => {
      isLocating.value = false;
      alert('Could not access your location.');
    },
    { timeout: 8000 }
  );
}

function zoomIn() {
  if (map) map.zoomIn(1, { animate: !reduceMotionActive() });
}

function zoomOut() {
  if (map) map.zoomOut(1, { animate: !reduceMotionActive() });
}
</script>

<template>
  <div class="relative w-full h-full min-h-87.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
    <div ref="mapContainer" class="w-full h-full z-10"></div>

    <!-- Empty State Overlay -->
    <div
      v-if="store.places.length === 0 && !ui.pinPickActive"
      class="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
      <div class="text-center space-y-4 px-6">
        <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <MapPin class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="font-serif font-bold text-xl text-gray-900 dark:text-gray-100">
          Your map is empty
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Add your first place to start mapping your taste and building honest rankings.
        </p>
        <button
          @click="ui.openModal('addPlace')"
          class="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Add your first place
        </button>
      </div>
    </div>

    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <button
        @click="zoomIn"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
        aria-label="Zoom in"
      >
        <Plus class="w-4 h-4" />
      </button>

      <button
        @click="zoomOut"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
        aria-label="Zoom out"
      >
        <Minus class="w-4 h-4" />
      </button>

      <button
        @click="fitAllPins"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
        title="View all places"
        aria-label="View all places"
      >
        <Compass class="w-4 h-4" />        
      </button>

      <button
        @click="locateUser"
        :disabled="isLocating"
        class="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        title="Center on my location"
        aria-label="Center on my location"
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

    <!-- Pin Pick Mode -->
    <div
      v-if="ui.pinPickActive"
      role="status"
      aria-live="polite"
      class="absolute inset-x-0 top-0 z-40 flex justify-center p-3 pointer-events-none"
    >
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 pointer-events-auto">
        <MapPin class="w-4 h-4 text-primary shrink-0" />
        <p class="text-xs font-medium text-gray-900 dark:text-gray-100">
          {{ ui.pinPickCoords ? 'Pin placed — use it or click the map again to move it' : 'Click on the map to drop the pin' }}
        </p>
        <button
          @click="ui.confirmPinPick()"
          :disabled="!ui.pinPickCoords"
          class="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-40"
        >
          Use this location
        </button>
        <button
          @click="ui.cancelPinPick()"
          class="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
