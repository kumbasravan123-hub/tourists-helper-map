import React, { useState } from 'react';
import { TouristProvider, useTourist } from './context/TouristContext';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { PlaceCard } from './components/PlaceCard';
import { PlaceDetailsModal } from './components/PlaceDetailsModal';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { OfflineManager } from './components/OfflineManager';
import { AddGemModal } from './components/AddGemModal';
import { Place, PlaceCategory } from './types';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Filter,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

function TouristApp() {
  const {
    currentCity,
    filteredPlaces,
    categoryFilter,
    setCategoryFilter,
    onlyOpenNow,
    setOnlyOpenNow,
    onlyHiddenGems,
    setOnlyHiddenGems,
    selectedPlace,
    setSelectedPlaceId,
    searchQuery,
    setSearchQuery,
    isOnline
  } = useTourist();

  const [activeTab, setActiveTab] = useState<'discover' | 'itinerary' | 'offline'>('discover');
  const [showAddGemModal, setShowAddGemModal] = useState(false);
  const [showRouteOnMap, setShowRouteOnMap] = useState(true);
  const [mobileViewMode, setMobileViewMode] = useState<'split' | 'list' | 'map'>('split');

  const categories: { key: 'all' | PlaceCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All Sights & Eats', icon: '🌍' },
    { key: 'attraction', label: 'Attractions', icon: '🏛️' },
    { key: 'gem', label: 'Hidden Gems', icon: '✨' },
    { key: 'restaurant', label: 'Local Eats', icon: '🍜' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddGem={() => setShowAddGemModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategoryFilter(c.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      categoryFilter === c.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Toggles: Hidden Gems Only & Open Now */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyHiddenGems(!onlyHiddenGems)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                    onlyHiddenGems
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hidden Gems Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                    onlyOpenNow
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${onlyOpenNow ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                  <span>Open Now</span>
                </button>

                {/* Mobile view toggle between List and Map */}
                <div className="lg:hidden flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMobileViewMode('list')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      mobileViewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileViewMode('map')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      mobileViewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Split Content: Places List (Left) + Interactive Map (Right) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Places List Column */}
              <div
                className={`lg:col-span-6 xl:col-span-5 space-y-4 ${
                  mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Results Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-semibold text-slate-500">
                    Showing <strong className="text-slate-900">{filteredPlaces.length}</strong> real-time spots in {currentCity.name}
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear search "{searchQuery}"
                    </button>
                  )}
                </div>

                {/* Places Grid */}
                {filteredPlaces.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No matching locations found</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Try adjusting filters or searching for different neighborhoods or foods.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {filteredPlaces.map(place => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        onOpenDetails={p => setSelectedPlaceId(p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Map Column */}
              <div
                className={`lg:col-span-6 xl:col-span-7 h-[550px] lg:h-[calc(100vh-210px)] sticky top-28 ${
                  mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
                }`}
              >
                <InteractiveMap
                  onSelectPlace={place => setSelectedPlaceId(place.id)}
                  showItineraryRoute={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY PLANNER TAB */}
        {activeTab === 'itinerary' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 xl:col-span-7">
              <ItineraryPlanner
                onFocusPlace={placeId => setSelectedPlaceId(placeId)}
                showRouteOnMap={showRouteOnMap}
                setShowRouteOnMap={setShowRouteOnMap}
              />
            </div>
            <div className="lg:col-span-6 xl:col-span-5 h-[480px] lg:h-[calc(100vh-200px)] sticky top-28">
              <InteractiveMap
                onSelectPlace={place => setSelectedPlaceId(place.id)}
                showItineraryRoute={showRouteOnMap}
              />
            </div>
          </div>
        )}

        {/* OFFLINE ACCESSIBILITY TAB */}
        {activeTab === 'offline' && (
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <OfflineManager />
          </div>
        )}
      </main>

      {/* Place Details & Reviews Modal */}
      {selectedPlace && (
        <PlaceDetailsModal
          place={selectedPlace}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}

      {/* Add New Hidden Gem Modal */}
      {showAddGemModal && (
        <AddGemModal onClose={() => setShowAddGemModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <TouristProvider>
      <TouristApp />
    </TouristProvider>
  );
}
