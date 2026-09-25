// ── Parking Types ──────────────────────────────────────────────────────────

export type ParkingType =
  | 'street' | 'garage' | 'lot' | 'private' | 'mall'
  | 'airport' | 'hospital' | 'hotel' | 'office' | 'residential' | 'valet' | 'public';

export type VehicleType = 'car' | 'motorcycle' | 'suv' | 'van' | 'ev';

export type Amenity =
  | 'ev_charging' | 'security' | 'cctv' | 'covered' | 'accessible'
  | 'restroom' | 'valet' | 'lighting' | 'car_wash';

export type AvailabilityStatus = 'available' | 'limited' | 'full' | 'unknown' | 'closed';

export type PricingUnit = 'hour' | 'day' | 'month' | 'flat';

export type UserRole = 'user' | 'operator' | 'admin';

// ── Parking Location ───────────────────────────────────────────────────────

export interface ParkingLocation {
  id: string;
  owner_id: string | null;
  name: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  parking_type: ParkingType;
  vehicle_types: VehicleType[];
  amenities: Amenity[];
  total_spaces?: number;
  available_spaces?: number;
  availability_status: AvailabilityStatus;
  price?: number;
  currency: string;
  pricing_unit?: PricingUnit;
  rating?: number;
  review_count: number;
  is_24_7: boolean;
  opening_time?: string;
  closing_time?: string;
  is_active: boolean;
  last_availability_update?: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  parking_images?: ParkingImage[];
}

export interface ParkingImage {
  id: string;
  parking_id: string;
  image_url: string;
  alt_text?: string;
  created_at: string;
}

// ── User / Profile ─────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// ── Favorites ──────────────────────────────────────────────────────────────

export interface Favorite {
  id: string;
  user_id: string;
  parking_id: string;
  created_at: string;
  parking_locations?: ParkingLocation;
}

// ── Reviews ────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  user_id: string;
  parking_id: string;
  rating: number;
  review_text?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { id: string; full_name?: string; avatar_url?: string };
}

// ── Reports ────────────────────────────────────────────────────────────────

export type ReportType =
  | 'incorrect_price' | 'incorrect_location' | 'closed_parking'
  | 'incorrect_availability' | 'duplicate' | 'incorrect_hours' | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

export interface ParkingReport {
  id: string;
  user_id: string | null;
  parking_id: string;
  report_type: ReportType;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

// ── Search History ─────────────────────────────────────────────────────────

export interface SearchHistory {
  id: string;
  user_id?: string;
  search_query?: string;
  latitude?: number;
  longitude?: number;
  filters: Record<string, unknown>;
  result_count: number;
  created_at: string;
}

// ── Search Filters ─────────────────────────────────────────────────────────

export interface SearchFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  query?: string;
  city?: string;
  maxPrice?: number;
  parkingType?: ParkingType;
  vehicleType?: VehicleType;
  availability?: AvailabilityStatus;
  evCharging?: boolean;
  covered?: boolean;
  security?: boolean;
  accessible?: boolean;
  is24h?: boolean;
}

// ── AI Types ───────────────────────────────────────────────────────────────

export interface AIIntent {
  destination: string | null;
  maxPrice: number | null;
  currency: string | null;
  durationMinutes: number | null;
  parkingType: ParkingType | null;
  vehicleType: VehicleType | null;
  availabilityRequired: boolean;
  evCharging: boolean;
  covered: boolean;
  security: boolean;
  accessible: boolean;
  is24x7: boolean;
  explicitRequirements: string[];
  missingInformation: string[];
}

export interface AIRecommendation {
  parkingId: string;
  reason: string;
  tradeoffs: string[];
  availabilityNote: string;
  parking: ParkingLocation;
}

export interface AIChatResponse {
  response: string;
  conversationId?: string;
}

// ── API Response ───────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
