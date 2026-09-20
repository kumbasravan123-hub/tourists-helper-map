import React, { useState } from 'react';
import { useTourist } from '../context/TouristContext';
import { PlaceCategory } from '../types';
import { X, Sparkles, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface AddGemModalProps {
  onClose: () => void;
}

export const AddGemModal: React.FC<AddGemModalProps> = ({ onClose }) => {
  const { currentCity, submitNewPlace, userLocation } = useTourist();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('gem');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [priceLevel, setPriceLevel] = useState<'$' | '$$' | '$$$' | '$$$$'>('$$');
  const [secretTip, setSecretTip] = useState('');
  const [openingHours, setOpeningHours] = useState('10:00 - 18:00');
  const [recommendedDuration, setRecommendedDuration] = useState('1 hour');
  const [imageUrl, setImageUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim()) return;

    // Use current user location or city center with a slight random offset
    const lat = userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.005 : currentCity.center[0] + (Math.random() - 0.5) * 0.01;
    const lng = userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.005 : currentCity.center[1] + (Math.random() - 0.5) * 0.01;

    const fallbackImg =
      category === 'restaurant'
        ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
        : category === 'gem'
        ? 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80';

    submitNewPlace({
      name: name.trim(),
      category,
      categoryLabel: category === 'gem' ? 'Hidden Gem' : category === 'restaurant' ? 'Local Restaurant' : 'Attraction',
      tagline: tagline.trim(),
      description: description.trim() || tagline.trim(),
      neighborhood: neighborhood.trim() || `${currentCity.name} Central`,
      lat,
      lng,
      priceLevel,
      imageUrl: imageUrl.trim() || fallbackImg,
      openingHours: openingHours.trim(),
      isOpenNow: true,
      isRealTimeGem: category === 'gem',
      secretTip: secretTip.trim() || 'Ask the staff for the local house special.',
      recommendedDuration: recommendedDuration.trim()
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">
            Submit a Secret Spot in {currentCity.name}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Share an undiscovered cafe, peaceful courtyard, or authentic eatery with fellow travelers.
        </p>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Gem Added to Live Map!</h4>
            <p className="text-xs text-slate-500">Other tourists can now discover your secret find.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Place Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Hidden Courtyard Kissaten"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as PlaceCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="gem">Hidden Gem</option>
                  <option value="restaurant">Local Restaurant / Cafe</option>
                  <option value="attraction">Attraction / Historic Landmark</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price Level</label>
                <select
                  value={priceLevel}
                  onChange={e => setPriceLevel(e.target.value as '$' | '$$' | '$$$' | '$$$$')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="$">$ (Budget / Free)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Upscale)</option>
                  <option value="$$$$">$$$$ (Fine Dining)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Neighborhood / District</label>
                <input
                  type="text"
                  placeholder="e.g. Higashiyama Alley"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 11:00 - 20:00"
                  value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catchy One-Line Tagline</label>
              <input
                type="text"
                required
                placeholder="e.g. 80-year-old wooden teahouse with koi pond and matcha waffles"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-amber-900 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Insider Secret Tip for Tourists
              </label>
              <input
                type="text"
                placeholder="e.g. Slide the wooden screen door; the tatami room upstairs is usually empty."
                value={secretTip}
                onChange={e => setSecretTip(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Publish Live to Map
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
