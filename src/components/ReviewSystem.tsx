import React, { useState } from 'react';
import { Review, Place } from '../types';
import { useTourist } from '../context/TouristContext';
import { Star, ThumbsUp, MessageSquare, Sparkles, Send, User, CheckCircle2 } from 'lucide-react';

interface ReviewSystemProps {
  place: Place;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({ place }) => {
  const { getReviewsForPlace, addReview, voteHelpful } = useTourist();
  const reviews = getReviewsForPlace(place.id);

  const [selectedTravelerFilter, setSelectedTravelerFilter] = useState<string>('All');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [travelerType, setTravelerType] = useState<Review['travelerType']>('Solo Traveler');
  const [content, setContent] = useState('');
  const [insiderTip, setInsiderTip] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addReview(
      place.id,
      rating,
      authorName,
      travelerType,
      content,
      insiderTip.trim() ? insiderTip : undefined
    );

    setContent('');
    setInsiderTip('');
    setShowReviewForm(false);
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  const filteredReviews = reviews.filter(r => {
    if (selectedTravelerFilter === 'All') return true;
    return r.travelerType === selectedTravelerFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Score Overview */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-inner">
              {place.rating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(place.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                Based on {reviews.length} traveler reviews
              </p>
              <p className="text-xs text-slate-500">
                Real-time verified community contributions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {submittedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your review &amp; tip have been published and cached for offline discovery!</span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Share Your Experience &amp; Insider Advice
            </h4>
            <span className="text-xs text-slate-500">Visible to all travelers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name / Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Solo Explorer Sam"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Traveler Type
              </label>
              <select
                value={travelerType}
                onChange={e => setTravelerType(e.target.value as Review['travelerType'])}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Backpacker">Backpacker</option>
                <option value="Local">Local Resident</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">
                {hoverRating || rating} of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Review &amp; Atmosphere
            </label>
            <textarea
              required
              rows={3}
              placeholder="What made this place stand out? How was the crowd, accessibility, and vibe?"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Insider Tip (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Visit at 7 AM, ask for the rooftop terrace, or try the seasonal dessert"
              value={insiderTip}
              onChange={e => setInsiderTip(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Post Review
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-medium mr-1">Filter:</span>
        {['All', 'Solo Traveler', 'Couple', 'Family', 'Backpacker', 'Local'].map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedTravelerFilter(type)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedTravelerFilter === type
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No reviews found for "{selectedTravelerFilter}".</p>
          </div>
        ) : (
          filteredReviews.map(rev => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{rev.author}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {rev.travelerType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {rev.content}
              </p>

              {rev.insiderTip && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950">Insider Tip: </span>
                    <span>{rev.insiderTip}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => voteHelpful(rev.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    rev.userVotedHelpful
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
