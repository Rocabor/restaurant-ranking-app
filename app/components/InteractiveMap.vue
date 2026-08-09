<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { usePlacesStore } from '../stores/places';
import { useUIStore } from '../stores/ui';
import L from 'leaflet';
import { Compass, Navigation, Share2 } from '@lucide/vue';

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
    store.selectedPlaceId = id;
    ui.openDetailSheet();
  };
  (window as any).tastemapSharePlace = (id: string) => {
    store.selectedPlaceId = id;
    ui.openModal('share');
  };
  (window as any).tastemapStartDuel = (id: string) => {
    store.startDuel(id);
    ui.openModal('duel');
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
  updateMarkers();
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
    const isDark = ui.isDarkMode;

    const bg = isDark ? '#1c1917' : '#ffffff';
    const bgSecondary = isDark ? '#292524' : '#f5f5f4';
    const bgTertiary = isDark ? '#44403c' : '#e7e5e4';
    const textPrimary = isDark ? '#fafaf9' : '#1c1917';
    const textSecondary = isDark ? '#a8a29e' : '#57534e';
    const textTertiary = isDark ? '#78716c' : '#a8a29e';
    const border = isDark ? '#44403c' : '#e7e5e4';
    const primary = isDark ? '#34d399' : '#059669';
    const primaryHover = isDark ? '#6ee7b7' : '#047857';
    const primaryBg = isDark ? 'rgba(52,211,153,0.15)' : 'rgba(5,150,105,0.08)';
    const amber = isDark ? '#fbbf24' : '#d97706';
    const amberBg = isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.08)';

    const popupHtml = `
      <div style="padding:14px;min-width:220px;max-width:260px;font-family:'Switzer',system-ui,sans-serif;background:${bg};color:${textPrimary};border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,${isDark ? '0.5' : '0.12'});">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;${isRanked ? `background:${primary};color:#fff;` : `background:${amberBg};color:${amber};border:1px solid ${border};`}">
            ${isRanked ? `#${place.rank} Ranked` : '★ Want to Try'}
          </span>
          <span style="font-weight:700;font-size:12px;color:${primary};">${priceString}</span>
        </div>

        <div style="margin-bottom:8px;">
          <div style="font-family:'Bespoke Serif',Georgia,serif;font-weight:700;font-size:15px;line-height:1.2;color:${textPrimary};margin-bottom:2px;">${place.name}</div>
          <div style="font-size:11px;color:${textSecondary};font-weight:500;">${place.cuisine} • ${place.area}</div>
        </div>

        ${place.specialty ? `
          <div style="padding:8px 10px;border-radius:10px;background:${bgSecondary};border:1px solid ${border};margin-bottom:8px;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${textTertiary};margin-bottom:2px;">⭐ Signature Dish</div>
            <div style="font-size:11px;color:${textSecondary};font-style:italic;line-height:1.4;">"${place.specialty}"</div>
          </div>
        ` : ''}

        <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid ${border};">
          <button onclick="window.tastemapOpenPlace('${place.id}')"
            style="flex:1;padding:8px 10px;border-radius:10px;background:${primary};color:#fff;border:none;font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;box-shadow:0 2px 8px ${primary}33;"
            onmouseover="this.style.background='${primaryHover}'"
            onmouseout="this.style.background='${primary}'">
            View Details
          </button>
          <button onclick="window.tastemapSharePlace('${place.id}')"
            style="padding:8px 10px;border-radius:10px;background:${primaryBg};color:${primary};border:1px solid ${border};font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;"
            onmouseover="this.style.background='${primary}';this.style.color='#fff'"
            onmouseout="this.style.background='${primaryBg}';this.style.color='${primary}'"
            title="Share">
            ➜          
          </button>
          <button onclick="window.tastemapStartDuel('${place.id}')"
            style="padding:8px 10px;border-radius:10px;background:${bgSecondary};color:${textPrimary};border:1px solid ${border};font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.15s;"
            onmouseover="this.style.background='${bgTertiary}'"
            onmouseout="this.style.background='${bgSecondary}'"
            title="Compare in Duel">
            ⚔️
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
