import React, { useState } from 'react';
import { Place } from '../types';
import { useTourist } from '../context/TouristContext';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../utils/geoUtils';
import { Star, MapPin, Clock, Sparkles, Plus, Check, Volume2, Navigation } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onOpenDetails: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onOpenDetails }) => {
  const {
    userLocation,
    setSelectedPlaceId,
    setHighlightedPlaceId,
    isPlaceInItinerary,
    addToItinerary,
    activeDay
  } = useTourist();

  const [addedJustNow, setAddedJustNow] = useState(false);
  const inItinerary = isPlaceInItinerary(place.id);

  // Distance calculation
  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  const handleQuickAddItinerary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inItinerary) {
      addToItinerary(place.id, activeDay, 'Morning');
      setAddedJustNow(true);
      setTimeout(() => setAddedJustNow(false), 2000);
    }
  };

  const handleFocusOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlaceId(place.id);
  };

  return (
    <div
      id={`place-card-${place.id}`}
      onClick={() => onOpenDetails(place)}
      onMouseEnter={() => setHighlightedPlaceId(place.id)}
      onMouseLeave={() => setHighlightedPlaceId(null)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Image Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Category Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-slate-900/80 text-white shadow-sm">
              {place.categoryLabel}
            </span>
            {place.isRealTimeGem && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-950" />
                Hidden Gem
              </span>
            )}
          </div>

          {/* Price Tag & Audio guide badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {place.audioGuideAvailable && (
              <span className="p-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md" title="Audio guide story available">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
              {place.priceLevel}
            </span>
          </div>

          {/* Real-time Status Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <span className={`px-2 py-0.5 rounded-full font-medium backdrop-blur-md ${place.isOpenNow ? 'bg-emerald-900/80 text-emerald-200' : 'bg-rose-900/80 text-rose-200'}`}>
              ● {place.isOpenNow ? 'Open Now' : 'Closed Today'}
            </span>

            {distanceKm !== null && (
              <span className="px-2 py-0.5 rounded-full font-medium bg-slate-900/80 text-slate-200 backdrop-blur-md">
                {formatDistance(distanceKm)} • ~{estimateWalkingMinutes(distanceKm)}m walk
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              {place.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {place.neighborhood}
          </p>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {place.tagline}
          </p>

          {/* Secret Tip Callout */}
          {place.secretTip && (
            <div className="mt-3 p-2 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-1.5 text-xs text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">
                <strong className="font-semibold text-amber-950">Local Tip:</strong> {place.secretTip}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Details & Action Bar */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-900">{place.rating.toFixed(1)}</span>
          <span className="text-slate-400">({place.reviewCount})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFocusOnMap}
            title="Show on map"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleQuickAddItinerary}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              inItinerary || addedJustNow
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {inItinerary || addedJustNow ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Planned</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
