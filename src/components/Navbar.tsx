import React, { useState } from 'react';
import { useTourist } from '../context/TouristContext';
import {
  Compass,
  MapPin,
  Search,
  Navigation,
  Sparkles,
  Calendar,
  HardDrive,
  Plus,
  Wifi,
  WifiOff,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'discover' | 'itinerary' | 'offline';
  setActiveTab: (tab: 'discover' | 'itinerary' | 'offline') => void;
  onOpenAddGem: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddGem
}) => {
  const {
    cities,
    currentCity,
    setCurrentCityId,
    searchQuery,
    setSearchQuery,
    userLocation,
    isLocating,
    requestUserLocation,
    itinerary,
    isOnline,
    offlinePacks
  } = useTourist();

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const currentPack = offlinePacks[currentCity.id];

  return (
    <header className="sticky top-0 z-[1100] bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Tier: Brand, City Selector, Status & CTA */}
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Logo & Destination Picker */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                  WanderWise
                </h1>
                <p className="text-[10px] font-semibold text-slate-400">Real-Time Tourist Guide</p>
              </div>
            </div>

            {/* City Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors border border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentCity.name}, {currentCity.country}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCityDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Select Tourist Destination
                  </div>
                  {cities.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCurrentCityId(c.id);
                        setShowCityDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        c.id === currentCity.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div>
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({c.country})</span>
                      </div>
                      {offlinePacks[c.id] && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                          Offline Pack
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Input on Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${currentCity.name} sights, food, hidden gems...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2">
            {/* GPS Location Button */}
            <button
              type="button"
              onClick={requestUserLocation}
              disabled={isLocating}
              title="Locate my position for walking distances"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLocating ? 'Locating...' : userLocation ? 'GPS Synced' : 'Find Near Me'}
              </span>
            </button>

            {/* Offline Pack Status Icon */}
            <button
              type="button"
              onClick={() => setActiveTab('offline')}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isOnline
                  ? currentPack
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-amber-300 bg-amber-100 text-amber-900'
              }`}
              title="Offline Accessibility Settings"
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              )}
              <span className="hidden lg:inline">
                {!isOnline ? 'Offline' : currentPack ? 'Pack Cached' : 'Offline Pack'}
              </span>
            </button>

            {/* Add Hidden Gem CTA */}
            <button
              type="button"
              onClick={onOpenAddGem}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Gem</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${currentCity.name} attractions, gems, food...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 border-t border-slate-100 py-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover &amp; Interactive Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'itinerary'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Itinerary Planner</span>
            {itinerary.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-bold">
                {itinerary.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Offline Guides &amp; Survival</span>
            {currentPack && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
