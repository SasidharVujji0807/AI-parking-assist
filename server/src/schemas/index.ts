import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────────────────

export const ParkingTypeSchema = z.enum([
  'street', 'garage', 'lot', 'private', 'mall',
  'airport', 'hospital', 'hotel', 'office', 'residential', 'valet', 'public',
]);

export const VehicleTypeSchema = z.enum(['car', 'motorcycle', 'suv', 'van', 'ev']);

export const AmenitySchema = z.enum([
  'ev_charging', 'security', 'cctv', 'covered', 'accessible',
  'restroom', 'valet', 'lighting', 'car_wash',
]);

export const AvailabilityStatusSchema = z.enum([
  'available', 'limited', 'full', 'unknown', 'closed',
]);

export const PricingUnitSchema = z.enum(['hour', 'day', 'month', 'flat']);

export const UserRoleSchema = z.enum(['user', 'operator', 'admin']);

// ── Parking Schemas ────────────────────────────────────────────────────────

export const ParkingCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(5).max(500),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  parking_type: ParkingTypeSchema,
  vehicle_types: z.array(VehicleTypeSchema).default([]),
  amenities: z.array(AmenitySchema).default([]),
  total_spaces: z.number().int().min(0).optional(),
  available_spaces: z.number().int().min(0).optional(),
  availability_status: AvailabilityStatusSchema.default('unknown'),
  price: z.number().min(0).optional(),
  currency: z.string().default('INR'),
  pricing_unit: PricingUnitSchema.optional(),
  is_24_7: z.boolean().default(false),
  opening_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closing_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const ParkingUpdateSchema = ParkingCreateSchema.partial();

export const ParkingSearchSchema = z.object({
  lat: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  lng: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  radius: z.string().optional().transform(v => v ? parseFloat(v) : 10),
  query: z.string().optional(),
  city: z.string().optional(),
  maxPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  parkingType: ParkingTypeSchema.optional(),
  vehicleType: VehicleTypeSchema.optional(),
  availability: AvailabilityStatusSchema.optional(),
  evCharging: z.string().optional().transform(v => v === 'true'),
  covered: z.string().optional().transform(v => v === 'true'),
  security: z.string().optional().transform(v => v === 'true'),
  accessible: z.string().optional().transform(v => v === 'true'),
  is24h: z.string().optional().transform(v => v === 'true'),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 50),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

export const ParkingSchema = ParkingCreateSchema.extend({
  id: z.string().uuid(),
  owner_id: z.string().uuid().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().default(0),
  is_active: z.boolean().default(true),
  last_availability_update: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  distance_km: z.number().optional(),
});

// ── Review Schemas ─────────────────────────────────────────────────────────

export const ReviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(10).max(2000).optional(),
});

export const ReviewUpdateSchema = ReviewCreateSchema.partial();

export const ReviewSchema = ReviewCreateSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  parking_id: z.string().uuid(),
  is_approved: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Report Schemas ─────────────────────────────────────────────────────────

export const ReportTypeSchema = z.enum([
  'incorrect_price', 'incorrect_location', 'closed_parking',
  'incorrect_availability', 'duplicate', 'incorrect_hours', 'other',
]);

export const ReportCreateSchema = z.object({
  report_type: ReportTypeSchema,
  description: z.string().max(2000).optional(),
});

export const ReportSchema = ReportCreateSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  parking_id: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'resolved', 'rejected']),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Search History ─────────────────────────────────────────────────────────

export const SearchHistoryCreateSchema = z.object({
  search_query: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  filters: z.record(z.unknown()).default({}),
  result_count: z.number().int().default(0),
});

// ── Favorite Schema ────────────────────────────────────────────────────────

export const FavoriteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  parking_id: z.string().uuid(),
  created_at: z.string(),
});

// ── AI Schemas ─────────────────────────────────────────────────────────────

export const AIIntentSchema = z.object({
  destination: z.string().nullable(),
  maxPrice: z.number().nullable(),
  currency: z.string().nullable(),
  durationMinutes: z.number().nullable(),
  parkingType: ParkingTypeSchema.nullable(),
  vehicleType: VehicleTypeSchema.nullable(),
  availabilityRequired: z.boolean(),
  evCharging: z.boolean(),
  covered: z.boolean(),
  security: z.boolean(),
  accessible: z.boolean(),
  is24x7: z.boolean(),
  explicitRequirements: z.array(z.string()),
  missingInformation: z.array(z.string()),
});

export const AIRecommendationItemSchema = z.object({
  parkingId: z.string().uuid(),
  reason: z.string(),
  tradeoffs: z.array(z.string()),
  availabilityNote: z.string(),
});

export const AIRecommendationResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(AIRecommendationItemSchema),
});

export const AIChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
});

// ── Route Param Schemas ────────────────────────────────────────────────────

export const UUIDParamSchema = z.object({
  id: z.string().uuid(),
});

// ── Type Exports ───────────────────────────────────────────────────────────

export type ParkingCreate = z.infer<typeof ParkingCreateSchema>;
export type ParkingUpdate = z.infer<typeof ParkingUpdateSchema>;
export type ParkingSearch = z.infer<typeof ParkingSearchSchema>;
export type Parking = z.infer<typeof ParkingSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type ReportCreate = z.infer<typeof ReportCreateSchema>;
export type SearchHistoryCreate = z.infer<typeof SearchHistoryCreateSchema>;
export type AIIntent = z.infer<typeof AIIntentSchema>;
export type AIRecommendationResponse = z.infer<typeof AIRecommendationResponseSchema>;
export type AIChatRequest = z.infer<typeof AIChatRequestSchema>;
