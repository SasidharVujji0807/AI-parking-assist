import { calculateDistance } from '../../utils/helpers';

export interface ParkingCandidate {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price?: number | null;
  pricing_unit?: string | null;
  availability_status: string;
  rating?: number | null;
  review_count: number;
  amenities: string[];
  parking_type: string;
  vehicle_types: string[];
  is_24_7: boolean;
  is_active: boolean;
  distance_km?: number;
}

export interface ScoringWeights {
  distance: number;
  price: number;
  rating: number;
  availability: number;
  amenities: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  distance: 0.30,
  price: 0.25,
  rating: 0.25,
  availability: 0.15,
  amenities: 0.05,
};

function availabilityScore(status: string): number {
  switch (status) {
    case 'available': return 1.0;
    case 'limited': return 0.6;
    case 'unknown': return 0.3;
    case 'full': return 0.0;
    case 'closed': return 0.0;
    default: return 0.3;
  }
}

export function scoreAndRank(
  candidates: ParkingCandidate[],
  preferences: {
    maxPrice?: number | null;
    evCharging?: boolean;
    covered?: boolean;
    security?: boolean;
    accessible?: boolean;
    is24x7?: boolean;
    vehicleType?: string | null;
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Array<ParkingCandidate & { score: number }> {
  if (candidates.length === 0) return [];

  // Normalize price: lower is better
  const prices = candidates
    .map(c => c.price ?? 0)
    .filter(p => p > 0);
  const maxP = Math.max(...prices, 1);

  // Normalize distance: lower is better
  const distances = candidates.map(c => c.distance_km ?? 0);
  const maxD = Math.max(...distances, 1);

  const scored = candidates.map(c => {
    // Distance score (0-1, closer = higher)
    const distScore = 1 - Math.min((c.distance_km ?? 0) / maxD, 1);

    // Price score (0-1, cheaper = higher)
    const priceScore = c.price
      ? 1 - Math.min(c.price / maxP, 1)
      : 0.5; // Unknown price gets middle score

    // Rating score (0-1)
    const ratingScore = ((c.rating ?? 0) / 5);

    // Availability score (0-1)
    const avScore = availabilityScore(c.availability_status);

    // Amenity match score (0-1)
    let amenityScore = 0;
    let amenityChecks = 0;
    if (preferences.evCharging) {
      amenityChecks++;
      if (c.amenities.includes('ev_charging')) amenityScore++;
    }
    if (preferences.covered) {
      amenityChecks++;
      if (c.amenities.includes('covered')) amenityScore++;
    }
    if (preferences.security) {
      amenityChecks++;
      if (c.amenities.includes('security') || c.amenities.includes('cctv')) amenityScore++;
    }
    if (preferences.accessible) {
      amenityChecks++;
      if (c.amenities.includes('accessible')) amenityScore++;
    }
    const finalAmenityScore = amenityChecks > 0 ? amenityScore / amenityChecks : 0.5;

    // Hard filters (eliminate disqualified candidates)
    let disqualified = false;
    if (preferences.maxPrice && c.price && c.price > preferences.maxPrice) disqualified = true;
    if (preferences.evCharging && !c.amenities.includes('ev_charging')) disqualified = true;
    if (preferences.covered && !c.amenities.includes('covered')) disqualified = true;
    if (preferences.is24x7 && !c.is_24_7) disqualified = true;
    if (preferences.vehicleType && !c.vehicle_types.includes(preferences.vehicleType)) {
      // Soft penalty, not full disqualification
    }

    if (disqualified) return { ...c, score: -1 };

    const totalScore =
      distScore * weights.distance +
      priceScore * weights.price +
      ratingScore * weights.rating +
      avScore * weights.availability +
      finalAmenityScore * weights.amenities;

    return { ...c, score: totalScore };
  });

  return scored
    .filter(c => c.score >= 0)
    .sort((a, b) => b.score - a.score);
}

export function applySearchFilters(
  candidates: ParkingCandidate[],
  filters: {
    lat?: number;
    lng?: number;
    radius?: number;
    maxPrice?: number;
    parkingType?: string;
    vehicleType?: string;
    availability?: string;
    evCharging?: boolean;
    covered?: boolean;
    security?: boolean;
    accessible?: boolean;
    is24h?: boolean;
  }
): ParkingCandidate[] {
  return candidates
    .map(c => {
      // Attach distance if coordinates available
      if (filters.lat && filters.lng) {
        return {
          ...c,
          distance_km: calculateDistance(filters.lat!, filters.lng!, c.latitude, c.longitude),
        };
      }
      return c;
    })
    .filter(c => {
      if (!c.is_active) return false;
      if (filters.lat && filters.lng && filters.radius) {
        if ((c.distance_km ?? Infinity) > filters.radius) return false;
      }
      if (filters.maxPrice && c.price && c.price > filters.maxPrice) return false;
      if (filters.parkingType && c.parking_type !== filters.parkingType) return false;
      if (filters.vehicleType && !c.vehicle_types.includes(filters.vehicleType)) return false;
      if (filters.availability && c.availability_status !== filters.availability) return false;
      if (filters.evCharging && !c.amenities.includes('ev_charging')) return false;
      if (filters.covered && !c.amenities.includes('covered')) return false;
      if (filters.security && !c.amenities.includes('security') && !c.amenities.includes('cctv')) return false;
      if (filters.accessible && !c.amenities.includes('accessible')) return false;
      if (filters.is24h && !c.is_24_7) return false;
      return true;
    });
}
