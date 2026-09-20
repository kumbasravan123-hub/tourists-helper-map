import React, { useState } from 'react';
import { useTourist } from '../context/TouristContext';
import {
  Wifi,
  WifiOff,
  Download,
  CheckCircle2,
  PhoneCall,
  Languages,
  HardDrive,
  ShieldCheck,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';

export const OfflineManager: React.FC = () => {
  const {
    currentCity,
    cities,
    isOnline,
    isOfflineSimulated,
    toggleOfflineSimulation,
    offlinePacks,
    downloadOfflinePack,
    removeOfflinePack
  } = useTourist();

  const [downloadingCity, setDownloadingCity] = useState<string | null>(null);

  const handleDownload = (cityId: string) => {
    setDownloadingCity(cityId);
    setTimeout(() => {
      downloadOfflinePack(cityId);
      setDownloadingCity(null);
    }, 800);
  };

  const currentPack = offlinePacks[currentCity.id];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Offline Accessibility &amp; Travel Packs
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed for travelers abroad without international roaming or unstable mobile reception.
          </p>
        </div>

        {/* Real-time Connection Status & Simulator */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold">
            {isOnline ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-800">Online</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-amber-800">Offline Mode Active</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleOfflineSimulation}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              isOfflineSimulated
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isOfflineSimulated ? 'Simulating Offline' : 'Simulate Offline Mode'}
          </button>
        </div>
      </div>

      {/* Offline Pack Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Current Destination
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {currentCity.name}, {currentCity.country} Offline Guide
            </h4>
          </div>

          {currentPack ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Cached &amp; Ready Offline
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              Not Stored Locally
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Downloading this pack stores all {currentCity.name} attractions, hidden gems, reviews, opening hours, offline emergency hotlines, and travel phrasebook locally in your browser.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
          <div className="text-xs text-slate-500">
            {currentPack ? (
              <span>Last updated: <strong>{currentPack.downloadedAt}</strong> • {currentPack.placesCount} places • {currentPack.reviewsCount} reviews</span>
            ) : (
              <span>Estimated download size: ~180 KB (Instant)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentPack && (
              <button
                type="button"
                onClick={() => removeOfflinePack(currentCity.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Cache</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDownload(currentCity.id)}
              disabled={downloadingCity === currentCity.id}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingCity === currentCity.id
                  ? 'Saving Pack...'
                  : currentPack
                  ? 'Re-sync Offline Pack'
                  : 'Download Offline Pack'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Emergency Essentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>Offline Emergency &amp; Assistance Hotlines</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Police &amp; Medical:</span>
              <span className="font-bold text-rose-700 text-sm">{currentCity.emergencyPhone}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Tourist Assistance Hotline:</span>
              <span className="font-bold text-blue-700 text-xs">{currentCity.touristHotline}</span>
            </div>

            <p className="text-[11px] text-slate-500">
              *Emergency numbers can be dialed from any mobile phone even without active roaming SIM data.
            </p>
          </div>
        </div>

        {/* Offline Essential Phrases */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Languages className="w-4 h-4" />
            <span>Pocket Language Survival Guide</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentCity.commonPhrases.map((p, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-slate-900">{p.phrase}</strong>
                  <span className="text-slate-500 italic text-[11px]">"{p.pronunciation}"</span>
                </div>
                <span className="text-blue-700 font-medium text-[11px] mt-0.5">{p.translation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available City Guides */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Available Destination Offline Guides
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cities.map(city => {
            const hasPack = !!offlinePacks[city.id];
            return (
              <div
                key={city.id}
                className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                  hasPack
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm">{city.name}</h5>
                    {hasPack ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Saved
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Not downloaded</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{city.country} • {city.currency}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDownload(city.id)}
                    disabled={downloadingCity === city.id}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{hasPack ? 'Update Pack' : 'Download'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
