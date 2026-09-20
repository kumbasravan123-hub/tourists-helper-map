import React, { useState } from 'react';
import { Place } from '../types';
import { useTourist } from '../context/TouristContext';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../utils/geoUtils';
import { ReviewSystem } from './ReviewSystem';
import {
  X,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Calendar,
  Volume2,
  Play,
  Pause,
  Plus,
  Check,
  Compass,
  Users,
  Utensils
} from 'lucide-react';

interface PlaceDetailsModalProps {
  place: Place;
  onClose: () => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose }) => {
  const {
    userLocation,
    addToItinerary,
    isPlaceInItinerary,
    activeDay,
    setSelectedPlaceId
  } = useTourist();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(activeDay);
  const [selectedSlot, setSelectedSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [addedNotice, setAddedNotice] = useState(false);

  const inItinerary = isPlaceInItinerary(place.id);

  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  const handleAddItinerary = () => {
    addToItinerary(place.id, selectedDay, selectedSlot);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Hero Image */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges in Hero */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md">
              {place.categoryLabel}
            </span>
            {place.isRealTimeGem && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Hidden Gem
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${place.isOpenNow ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
              ● {place.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
          </div>

          {/* Title & Info on Hero bottom */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{place.rating.toFixed(1)}</span>
              <span className="text-slate-300">({place.reviewCount} community reviews)</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">{place.priceLevel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {place.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {place.neighborhood}
              </span>
              {distanceKm !== null && (
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <Compass className="w-3.5 h-3.5" />
                  {formatDistance(distanceKm)} away (~{estimateWalkingMinutes(distanceKm)} min walk)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Hours</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{place.openingHours}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. Visit</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">{place.recommendedDuration}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>Crowd Level</span>
              </div>
              <p className={`text-xs font-bold mt-1 ${place.crowdLevel === 'Low' ? 'text-emerald-700' : place.crowdLevel === 'Moderate' ? 'text-amber-700' : 'text-rose-700'}`}>
                {place.crowdLevel || 'Moderate'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Best Hour</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{place.bestTimeToVisit || 'Morning'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Overview &amp; Experience
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {place.description}
            </p>
          </div>

          {/* Secret Insider Tip Callout */}
          {place.secretTip && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Local Tourist Insider Advice</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                {place.secretTip}
              </p>
            </div>
          )}

          {/* Restaurant Specialties or Culinary details */}
          {place.specialties && place.specialties.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                Must-Try Local Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {place.specialties.map(spec => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800"
                  >
                    {spec}
                  </span>
                ))}
                {place.dietaryOptions?.map(diet => (
                  <span
                    key={diet}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Audio Guide Player Feature */}
          {place.audioGuideAvailable && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">
                    Listen to Narrated Audio Story ({place.audioDuration || '5 min'})
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Offline-compatible historical insights and architectural lore
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors shrink-0"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4 text-blue-600" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-900" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Add to Itinerary Section */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Plan in Your Itinerary
                </h4>
              </div>
              {inItinerary && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  ✓ In Itinerary
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-700">Day:</span>
                <select
                  value={selectedDay}
                  onChange={e => setSelectedDay(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Day 1</option>
                  <option value={1}>Day 2</option>
                  <option value={2}>Day 3</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-700">Slot:</span>
                <select
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value as 'Morning' | 'Afternoon' | 'Evening')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddItinerary}
                className="ml-auto px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Day {selectedDay + 1}!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Review System */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tourist Reviews &amp; Community Tips
            </h3>
            <ReviewSystem place={place} />
          </div>
        </div>
      </div>
    </div>
  );
};
