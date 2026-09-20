import React, { useState } from 'react';
import { useTourist } from '../context/TouristContext';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../utils/geoUtils';
import {
  Calendar,
  Clock,
  Trash2,
  Share2,
  Printer,
  Navigation,
  Sparkles,
  MapPin,
  ChevronRight,
  Plus,
  Compass,
  Check
} from 'lucide-react';

interface ItineraryPlannerProps {
  onFocusPlace: (placeId: string) => void;
  showRouteOnMap: boolean;
  setShowRouteOnMap: (show: boolean) => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  onFocusPlace,
  showRouteOnMap,
  setShowRouteOnMap
}) => {
  const {
    currentCity,
    itinerary,
    activeDay,
    setActiveDay,
    removeFromItinerary,
    clearDayItinerary,
    currentDayItineraryPlaces,
    setSelectedPlaceId
  } = useTourist();

  const [copied, setCopied] = useState(false);

  // Group items by time slots
  const morningItems = currentDayItineraryPlaces.filter(i => i.item.timeSlot === 'Morning');
  const afternoonItems = currentDayItineraryPlaces.filter(i => i.item.timeSlot === 'Afternoon');
  const eveningItems = currentDayItineraryPlaces.filter(i => i.item.timeSlot === 'Evening');

  // Calculate total route distance & walking time
  let totalDistanceKm = 0;
  let totalWalkMinutes = 0;
  for (let i = 0; i < currentDayItineraryPlaces.length - 1; i++) {
    const p1 = currentDayItineraryPlaces[i].place;
    const p2 = currentDayItineraryPlaces[i + 1].place;
    const d = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    totalDistanceKm += d;
    totalWalkMinutes += estimateWalkingMinutes(d);
  }

  // Copy shareable itinerary text
  const handleCopySummary = () => {
    const lines = [
      `🎒 My ${currentCity.name} Itinerary - Day ${activeDay + 1}`,
      `Total Stops: ${currentDayItineraryPlaces.length} | Est. Walking: ${totalWalkMinutes} mins (${formatDistance(totalDistanceKm)})`,
      ''
    ];

    currentDayItineraryPlaces.forEach((entry, idx) => {
      lines.push(`${idx + 1}. [${entry.item.timeSlot} ${entry.item.customTime || ''}] ${entry.place.name} (${entry.place.categoryLabel})`);
      lines.push(`   Neighborhood: ${entry.place.neighborhood}`);
      if (entry.place.secretTip) {
        lines.push(`   Tip: ${entry.place.secretTip}`);
      }
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print itinerary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {currentCity.name} Trip Itinerary Planner
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize days, preview step-by-step walking routes, and access offline anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRouteOnMap(!showRouteOnMap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showRouteOnMap
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{showRouteOnMap ? 'Route Active on Map' : 'Show Route on Map'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1 transition-colors"
            title="Copy Itinerary Summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs transition-colors hidden sm:block"
            title="Print Itinerary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(dayIdx => {
            const count = itinerary.filter(i => i.dayIndex === dayIdx).length;
            return (
              <button
                key={dayIdx}
                type="button"
                onClick={() => setActiveDay(dayIdx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeDay === dayIdx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Day {dayIdx + 1}
                <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {currentDayItineraryPlaces.length > 0 && (
          <button
            type="button"
            onClick={() => clearDayItinerary(activeDay)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Day</span>
          </button>
        )}
      </div>

      {/* Day Summary Stats Banner */}
      {currentDayItineraryPlaces.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Stops</span>
              <strong className="text-slate-900 font-bold">{currentDayItineraryPlaces.length} locations</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Est. Walking</span>
              <strong className="text-slate-900 font-bold">~{totalWalkMinutes} mins ({formatDistance(totalDistanceKm)})</strong>
            </div>
          </div>

          <div className="text-xs text-blue-700 font-semibold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Optimal sequential order calculated</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentDayItineraryPlaces.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            No stops planned for Day {activeDay + 1} yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse attractions, hidden gems, or local restaurants on the map and click <strong>"Plan"</strong> to schedule your day.
          </p>
        </div>
      ) : (
        /* Itinerary Timeline View */
        <div className="space-y-6">
          {(['Morning', 'Afternoon', 'Evening'] as const).map(slot => {
            const slotItems = currentDayItineraryPlaces.filter(i => i.item.timeSlot === slot);
            if (slotItems.length === 0) return null;

            return (
              <div key={slot} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {slot}
                  </h4>
                </div>

                <div className="space-y-2.5 pl-3 border-l-2 border-slate-100">
                  {slotItems.map((entry, idx) => (
                    <div
                      key={entry.item.id}
                      className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-3.5 shadow-xs transition-all flex items-center justify-between gap-3"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => {
                          setSelectedPlaceId(entry.place.id);
                          onFocusPlace(entry.place.id);
                        }}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={entry.place.imageUrl}
                            alt={entry.place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-blue-600">
                              {entry.item.customTime || 'Scheduled'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {entry.place.categoryLabel}
                            </span>
                            {entry.place.isRealTimeGem && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Gem
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {entry.place.name}
                          </h5>

                          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {entry.place.neighborhood} • Est. {entry.place.recommendedDuration}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromItinerary(entry.item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove from itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
