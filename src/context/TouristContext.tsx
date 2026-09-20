import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Place, Review, DestinationCity, ItineraryItem, OfflinePackData, PlaceCategory } from '../types';
import { CITIES, INITIAL_PLACES, INITIAL_REVIEWS } from '../data/citiesAndPlaces';

interface TouristContextType {
  cities: DestinationCity[];
  currentCity: DestinationCity;
  setCurrentCityId: (cityId: string) => void;
  places: Place[];
  filteredPlaces: Place[];
  reviews: Review[];
  itinerary: ItineraryItem[];
  activeDay: number;
  setActiveDay: (day: number) => void;
  selectedPlace: Place | null;
  setSelectedPlaceId: (id: string | null) => void;
  highlightedPlaceId: string | null;
  setHighlightedPlaceId: (id: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
  isLocating: boolean;
  requestUserLocation: () => void;
  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: 'all' | PlaceCategory;
  setCategoryFilter: (cat: 'all' | PlaceCategory) => void;
  onlyOpenNow: boolean;
  setOnlyOpenNow: (open: boolean) => void;
  onlyHiddenGems: boolean;
  setOnlyHiddenGems: (gemsOnly: boolean) => void;
  // Itinerary Actions
  addToItinerary: (placeId: string, dayIndex: number, timeSlot: 'Morning' | 'Afternoon' | 'Evening', customTime?: string) => void;
  removeFromItinerary: (itemId: string) => void;
  clearDayItinerary: (dayIndex: number) => void;
  isPlaceInItinerary: (placeId: string) => boolean;
  currentDayItineraryPlaces: { item: ItineraryItem; place: Place }[];
  // Review Actions
  addReview: (placeId: string, rating: number, author: string, travelerType: Review['travelerType'], content: string, insiderTip?: string) => void;
  voteHelpful: (reviewId: string) => void;
  getReviewsForPlace: (placeId: string) => Review[];
  // Offline & Connectivity
  isOnline: boolean;
  isOfflineSimulated: boolean;
  toggleOfflineSimulation: () => void;
  offlinePacks: Record<string, OfflinePackData>;
  downloadOfflinePack: (cityId: string) => void;
  removeOfflinePack: (cityId: string) => void;
  // Add new gem
  submitNewPlace: (newPlace: Omit<Place, 'id' | 'rating' | 'reviewCount' | 'cityId'>) => void;
}

const TouristContext = createContext<TouristContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CITY_ID: 'tourist_app_city_id',
  PLACES: 'tourist_app_places_v1',
  REVIEWS: 'tourist_app_reviews_v1',
  ITINERARY: 'tourist_app_itinerary_v1',
  OFFLINE_PACKS: 'tourist_app_offline_packs_v1',
  OFFLINE_SIMULATION: 'tourist_app_offline_sim'
};

export const TouristProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Current City
  const [currentCityId, setCurrentCityIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CITY_ID) || 'kyoto';
  });

  const currentCity = useMemo(() => {
    return CITIES.find(c => c.id === currentCityId) || CITIES[0];
  }, [currentCityId]);

  const setCurrentCityId = (cityId: string) => {
    setCurrentCityIdState(cityId);
    localStorage.setItem(STORAGE_KEYS.CITY_ID, cityId);
    // Reset selected place when switching city
    setSelectedPlaceId(null);
  };

  // 2. Places State (cached in localStorage)
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLACES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse places cache', e);
      }
    }
    return INITIAL_PLACES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
  }, [places]);

  // 3. Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reviews cache', e);
      }
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  // 4. Itinerary State
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITINERARY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse itinerary cache', e);
      }
    }
    // Default sample itinerary items for Kyoto
    return [
      { id: 'itin-1', placeId: 'k-att-1', dayIndex: 0, timeSlot: 'Morning', customTime: '07:30', notes: 'Catch early morning quiet light at the vermilion gates', order: 0 },
      { id: 'itin-2', placeId: 'k-rest-1', dayIndex: 0, timeSlot: 'Afternoon', customTime: '12:15', notes: 'Sudachi citrus cold handmade soba', order: 1 },
      { id: 'itin-3', placeId: 'k-gem-1', dayIndex: 0, timeSlot: 'Afternoon', customTime: '14:30', notes: 'Peaceful raked sand mounds & cedar walk', order: 2 },
      { id: 'itin-4', placeId: 'k-gem-2', dayIndex: 0, timeSlot: 'Evening', customTime: '18:15', notes: 'Twilight blue-hour walk along Shirakawa canal', order: 3 },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(itinerary));
  }, [itinerary]);

  const [activeDay, setActiveDay] = useState<number>(0);

  // 5. Selected / Highlighted Place
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find(p => p.id === selectedPlaceId) || null;
  }, [selectedPlaceId, places]);

  // 6. User GPS Location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    // Default near current city center with slight offset
    return { lat: 35.0085, lng: 135.7675 };
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const requestUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using city center landmark:', err);
          // Fallback to current city center with slight tourist offset
          setUserLocation({
            lat: currentCity.center[0] + 0.003,
            lng: currentCity.center[1] + 0.002
          });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // 7. Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PlaceCategory>('all');
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);
  const [onlyHiddenGems, setOnlyHiddenGems] = useState<boolean>(false);

  // Filtered places for current city
  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      // Must match current city
      if (p.cityId !== currentCity.id) return false;

      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // Hidden gem toggle
      if (onlyHiddenGems && p.category !== 'gem' && !p.isRealTimeGem) return false;

      // Open now filter
      if (onlyOpenNow && !p.isOpenNow) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTagline = p.tagline.toLowerCase().includes(q);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(q);
        const matchesCategory = p.categoryLabel.toLowerCase().includes(q);
        const matchesSpecialties = p.specialties?.some(s => s.toLowerCase().includes(q)) ?? false;
        if (!matchesName && !matchesTagline && !matchesNeighborhood && !matchesCategory && !matchesSpecialties) {
          return false;
        }
      }

      return true;
    });
  }, [places, currentCity.id, categoryFilter, onlyHiddenGems, onlyOpenNow, searchQuery]);

  // 8. Offline & Connectivity
  const [isOnlineActual, setIsOnlineActual] = useState<boolean>(navigator.onLine);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_SIMULATION) === 'true';
  });

  useEffect(() => {
    const handleOnline = () => setIsOnlineActual(true);
    const handleOffline = () => setIsOnlineActual(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = isOnlineActual && !isOfflineSimulated;

  const toggleOfflineSimulation = () => {
    setIsOfflineSimulated(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SIMULATION, String(next));
      return next;
    });
  };

  // Offline Packs Store
  const [offlinePacks, setOfflinePacks] = useState<Record<string, OfflinePackData>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_PACKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default Kyoto downloaded pack for instant testability
    return {
      kyoto: {
        cityId: 'kyoto',
        cityName: 'Kyoto',
        downloadedAt: new Date().toLocaleDateString(),
        placesCount: 8,
        reviewsCount: 5,
        itinerarySynced: true,
        isReadyOffline: true
      }
    };
  });

  const downloadOfflinePack = (cityId: string) => {
    const city = CITIES.find(c => c.id === cityId);
    if (!city) return;
    const cityPlaces = places.filter(p => p.cityId === cityId);
    const cityReviews = reviews.filter(r => cityPlaces.some(p => p.id === r.placeId));

    const newPack: OfflinePackData = {
      cityId,
      cityName: city.name,
      downloadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      placesCount: cityPlaces.length,
      reviewsCount: cityReviews.length,
      itinerarySynced: true,
      isReadyOffline: true
    };

    const updated = { ...offlinePacks, [cityId]: newPack };
    setOfflinePacks(updated);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PACKS, JSON.stringify(updated));
  };

  const removeOfflinePack = (cityId: string) => {
    const updated = { ...offlinePacks };
    delete updated[cityId];
    setOfflinePacks(updated);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PACKS, JSON.stringify(updated));
  };

  // 9. Itinerary Actions
  const addToItinerary = (placeId: string, dayIndex: number, timeSlot: 'Morning' | 'Afternoon' | 'Evening', customTime?: string) => {
    const dayItems = itinerary.filter(i => i.dayIndex === dayIndex);
    const newItem: ItineraryItem = {
      id: `itin-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      placeId,
      dayIndex,
      timeSlot,
      customTime: customTime || (timeSlot === 'Morning' ? '09:00' : timeSlot === 'Afternoon' ? '14:00' : '19:00'),
      order: dayItems.length
    };
    setItinerary(prev => [...prev, newItem]);
  };

  const removeFromItinerary = (itemId: string) => {
    setItinerary(prev => prev.filter(i => i.id !== itemId));
  };

  const clearDayItinerary = (dayIndex: number) => {
    setItinerary(prev => prev.filter(i => i.dayIndex !== dayIndex));
  };

  const isPlaceInItinerary = (placeId: string): boolean => {
    return itinerary.some(i => i.placeId === placeId);
  };

  const currentDayItineraryPlaces = useMemo(() => {
    return itinerary
      .filter(i => i.dayIndex === activeDay)
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const place = places.find(p => p.id === item.placeId);
        return place ? { item, place } : null;
      })
      .filter((x): x is { item: ItineraryItem; place: Place } => x !== null);
  }, [itinerary, activeDay, places]);

  // 10. Review Actions
  const addReview = (placeId: string, rating: number, author: string, travelerType: Review['travelerType'], content: string, insiderTip?: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      placeId,
      author: author.trim() || 'Anonymous Explorer',
      rating,
      date: 'Just now',
      travelerType,
      content,
      insiderTip,
      helpfulCount: 0
    };

    setReviews(prev => [newRev, ...prev]);

    // Update place average rating & review count
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const newCount = p.reviewCount + 1;
        const newRating = Math.round(((p.rating * p.reviewCount + rating) / newCount) * 10) / 10;
        return {
          ...p,
          rating: newRating,
          reviewCount: newCount
        };
      }
      return p;
    }));
  };

  const voteHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        if (r.userVotedHelpful) {
          return { ...r, helpfulCount: r.helpfulCount - 1, userVotedHelpful: false };
        } else {
          return { ...r, helpfulCount: r.helpfulCount + 1, userVotedHelpful: true };
        }
      }
      return r;
    }));
  };

  const getReviewsForPlace = (placeId: string) => {
    return reviews.filter(r => r.placeId === placeId);
  };

  // 11. Add new hidden gem
  const submitNewPlace = (newPlaceData: Omit<Place, 'id' | 'rating' | 'reviewCount' | 'cityId'>) => {
    const newPlace: Place = {
      ...newPlaceData,
      id: `custom-gem-${Date.now()}`,
      cityId: currentCity.id,
      rating: 5.0,
      reviewCount: 1
    };
    setPlaces(prev => [newPlace, ...prev]);
  };

  return (
    <TouristContext.Provider
      value={{
        cities: CITIES,
        currentCity,
        setCurrentCityId,
        places,
        filteredPlaces,
        reviews,
        itinerary,
        activeDay,
        setActiveDay,
        selectedPlace,
        setSelectedPlaceId,
        highlightedPlaceId,
        setHighlightedPlaceId,
        userLocation,
        isLocating,
        requestUserLocation,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        onlyOpenNow,
        setOnlyOpenNow,
        onlyHiddenGems,
        setOnlyHiddenGems,
        addToItinerary,
        removeFromItinerary,
        clearDayItinerary,
        isPlaceInItinerary,
        currentDayItineraryPlaces,
        addReview,
        voteHelpful,
        getReviewsForPlace,
        isOnline,
        isOfflineSimulated,
        toggleOfflineSimulation,
        offlinePacks,
        downloadOfflinePack,
        removeOfflinePack,
        submitNewPlace
      }}
    >
      {children}
    </TouristContext.Provider>
  );
};

export const useTourist = () => {
  const context = useContext(TouristContext);
  if (!context) {
    throw new Error('useTourist must be used within a TouristProvider');
  }
  return context;
};
