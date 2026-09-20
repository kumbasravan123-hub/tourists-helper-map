import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTourist } from '../context/TouristContext';
import { Place } from '../types';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../utils/geoUtils';
import { Crosshair, Layers, Navigation, Sparkles, MapPin, Compass } from 'lucide-react';

interface InteractiveMapProps {
  onSelectPlace?: (place: Place) => void;
  showItineraryRoute?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectPlace,
  showItineraryRoute = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const {
    currentCity,
    filteredPlaces,
    selectedPlace,
    setSelectedPlaceId,
    highlightedPlaceId,
    userLocation,
    currentDayItineraryPlaces,
    isOnline
  } = useTourist();

  const [mapTileStyle, setMapTileStyle] = useState<'voyager' | 'standard' | 'toner'>('voyager');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentCity.center,
        zoom: currentCity.zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>')
        .addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Keep map alive unless unmounted
    };
  }, []);

  // Update Tile Layer based on style selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer if any
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (mapTileStyle === 'standard') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (mapTileStyle === 'toner') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains,
      maxZoom
    });

    tileLayer.addTo(map);
  }, [mapTileStyle]);

  // Center map on city change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(currentCity.center, currentCity.zoom, { animate: true });
  }, [currentCity]);

  // Render User Location Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
            <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      marker.bindPopup(`
        <div class="text-xs p-1 font-sans">
          <div class="font-semibold text-slate-800 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Your Real-Time Location
          </div>
          <p class="text-slate-500 mt-0.5">GPS synced for proximity discovery</p>
        </div>
      `);
      marker.addTo(map);
      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Render Markers and Itinerary Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Remove old route polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Check which places are in current day itinerary for sequence badges
    const itineraryPlaceMap = new Map<string, number>();
    currentDayItineraryPlaces.forEach((entry, idx) => {
      itineraryPlaceMap.set(entry.place.id, idx + 1);
    });

    filteredPlaces.forEach(place => {
      const isSelected = selectedPlace?.id === place.id;
      const isHighlighted = highlightedPlaceId === place.id;
      const itinOrder = itineraryPlaceMap.get(place.id);

      // Distinct marker styles by category
      let bgClass = 'bg-blue-600';
      let iconHtml = '🏛️';
      let ringClass = isSelected ? 'ring-4 ring-blue-300 scale-110' : '';

      if (place.category === 'gem') {
        bgClass = 'bg-amber-600';
        iconHtml = '✨';
        ringClass = isSelected ? 'ring-4 ring-amber-300 scale-110 shadow-amber-500/50' : 'shadow-amber-400/30';
      } else if (place.category === 'restaurant') {
        bgClass = 'bg-rose-600';
        iconHtml = '🍜';
        ringClass = isSelected ? 'ring-4 ring-rose-300 scale-110' : '';
      }

      // If in day itinerary, display sequential order badge
      const orderBadge = itinOrder !== undefined
        ? `<span class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center border border-white shadow">${itinOrder}</span>`
        : '';

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isHighlighted ? 'scale-125' : ''}">
          <div class="flex items-center justify-center w-8 h-8 rounded-full ${bgClass} text-white shadow-md border-2 border-white ${ringClass}">
            <span class="text-xs select-none">${iconHtml}</span>
          </div>
          ${orderBadge}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-place-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      // Calculate distance if userLocation is available
      let distanceText = '';
      if (userLocation) {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng);
        distanceText = `<span class="text-[11px] font-medium text-slate-500">${formatDistance(dist)} • ~${estimateWalkingMinutes(dist)}m walk</span>`;
      }

      // Popup Content
      const popupContent = `
        <div class="w-56 font-sans text-slate-800">
          <div class="relative h-24 w-full overflow-hidden rounded-t-lg">
            <img src="${place.imageUrl}" alt="${place.name}" class="w-full h-full object-cover" />
            <div class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
              ${place.categoryLabel}
            </div>
            ${place.isRealTimeGem ? '<div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">Hidden Gem</div>' : ''}
          </div>
          <div class="p-2.5">
            <h4 class="font-bold text-sm leading-tight text-slate-900 line-clamp-1">${place.name}</h4>
            <div class="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-1">
              <span>★ ${place.rating.toFixed(1)}</span>
              <span class="text-slate-400">(${place.reviewCount} reviews)</span>
              <span class="text-slate-400">•</span>
              <span class="text-slate-600">${place.priceLevel}</span>
            </div>
            <div class="mt-1 flex items-center justify-between">
              <span class="text-[11px] font-medium ${place.isOpenNow ? 'text-emerald-700' : 'text-rose-700'}">
                ● ${place.isOpenNow ? 'Open Now' : 'Closed'}
              </span>
              ${distanceText}
            </div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button id="map-btn-details-${place.id}" class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Details & Reviews &rarr;
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260, closeButton: false });

      marker.on('click', () => {
        setSelectedPlaceId(place.id);
        if (onSelectPlace) {
          onSelectPlace(place);
        }
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-btn-details-${place.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedPlaceId(place.id);
            if (onSelectPlace) {
              onSelectPlace(place);
            }
          };
        }
      });

      layer.addLayer(marker);
    });

    // Draw route if requested or if there are multiple itinerary stops
    if (showItineraryRoute && currentDayItineraryPlaces.length > 1) {
      const latlngs: [number, number][] = currentDayItineraryPlaces.map(entry => [
        entry.place.lat,
        entry.place.lng
      ]);

      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      routeLayerRef.current = polyline;
    }
  }, [
    filteredPlaces,
    selectedPlace,
    highlightedPlaceId,
    currentDayItineraryPlaces,
    userLocation,
    showItineraryRoute,
    onSelectPlace,
    setSelectedPlaceId
  ]);

  // Fly to selected place when selectedPlace changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, {
      duration: 1.2
    });
  }, [selectedPlace]);

  // Center on user location
  const handleCenterUser = () => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1 });
  };

  // Center on entire city
  const handleResetCityView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(currentCity.center, currentCity.zoom, { duration: 1 });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 flex flex-col">
      {/* Offline banner notification if simulating offline */}
      {!isOnline && (
        <div className="absolute top-3 left-3 z-[1000] bg-amber-900/90 text-amber-100 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md shadow-md flex items-center gap-2 border border-amber-700/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Offline Navigation Mode • Local map cached</span>
        </div>
      )}

      {/* Map Action Floating Toolbar */}
      <div className="absolute top-3 right-14 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-md border border-slate-200">
        <button
          type="button"
          onClick={handleCenterUser}
          title="Center on my location"
          className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Crosshair className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">My GPS</span>
        </button>

        <span className="w-px h-4 bg-slate-200"></span>

        <button
          type="button"
          onClick={handleResetCityView}
          title="Fit city view"
          className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Compass className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">City View</span>
        </button>

        <span className="w-px h-4 bg-slate-200"></span>

        <button
          type="button"
          onClick={() => {
            const next = mapTileStyle === 'voyager' ? 'standard' : mapTileStyle === 'standard' ? 'toner' : 'voyager';
            setMapTileStyle(next);
          }}
          title="Switch map layer style"
          className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Layers className="w-4 h-4 text-slate-600" />
          <span className="capitalize hidden md:inline">{mapTileStyle}</span>
        </button>
      </div>

      {/* Map Container */}
      <div id="tourist-interactive-map" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay at bottom left */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block"></span>
          <span>Attractions</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-amber-600 border border-white inline-block"></span>
          <span>Hidden Gems</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-rose-600 border border-white inline-block"></span>
          <span>Local Eats</span>
        </div>
      </div>
    </div>
  );
};
