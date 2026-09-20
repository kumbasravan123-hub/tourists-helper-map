export type PlaceCategory = 'attraction' | 'gem' | 'restaurant';

export interface Review {
  id: string;
  placeId: string;
  author: string;
  avatar?: string;
  rating: number; // 1-5
  date: string;
  travelerType: 'Solo Traveler' | 'Couple' | 'Family' | 'Backpacker' | 'Local';
  content: string;
  insiderTip?: string;
  helpfulCount: number;
  userVotedHelpful?: boolean;
}

export interface Place {
  id: string;
  cityId: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  neighborhood: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  imageUrl: string;
  openingHours: string;
  isOpenNow: boolean;
  isRealTimeGem: boolean; // special real-time hidden gem flag
  secretTip: string; // real-time local insider advice
  recommendedDuration: string; // e.g., "1.5 hours"
  specialties?: string[];
  dietaryOptions?: string[]; // For restaurants: Vegan, Halal, etc.
  audioGuideAvailable?: boolean;
  audioDuration?: string;
  crowdLevel?: 'Low' | 'Moderate' | 'Busy';
  bestTimeToVisit?: string;
}

export interface DestinationCity {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  zoom: number;
  description: string;
  currency: string;
  timezone: string;
  emergencyPhone: string;
  touristHotline: string;
  commonPhrases: { phrase: string; translation: string; pronunciation: string }[];
}

export interface ItineraryItem {
  id: string;
  placeId: string;
  dayIndex: number; // 0, 1, 2...
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  customTime?: string;
  notes?: string;
  order: number;
}

export interface OfflinePackData {
  cityId: string;
  cityName: string;
  downloadedAt: string;
  placesCount: number;
  reviewsCount: number;
  itinerarySynced: boolean;
  isReadyOffline: boolean;
}
