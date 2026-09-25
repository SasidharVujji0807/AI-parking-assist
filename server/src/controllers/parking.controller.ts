import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError, validateBody, validateQuery, calculateDistance } from '../utils/helpers';
import {
  ParkingCreateSchema, ParkingUpdateSchema, ParkingSearchSchema,
  UUIDParamSchema,
} from '../schemas';
import { applySearchFilters } from '../services/recommendations/scorer';

// ── GET /api/parking ───────────────────────────────────────────────────────

export async function searchParking(req: Request, res: Response) {
  const queryResult = ParkingSearchSchema.safeParse(req.query);
  if (!queryResult.success) {
    return apiError(res, 'Invalid query', 'VALIDATION_ERROR', 400, queryResult.error.flatten().fieldErrors);
  }

  const {
    lat, lng, radius = 10, query, city, maxPrice,
    parkingType, vehicleType, availability,
    evCharging, covered, security, accessible, is24h,
    limit = 50, offset = 0,
  } = queryResult.data;

  try {
    let dbQuery = supabaseAdmin
      .from('parking_locations')
      .select(`
        id, name, description, address, city, state, postal_code,
        latitude, longitude, parking_type, vehicle_types, amenities,
        total_spaces, available_spaces, availability_status,
        price, currency, pricing_unit, rating, review_count,
        is_24_7, opening_time, closing_time, is_active,
        last_availability_update, created_at, updated_at, owner_id
      `)
      .eq('is_active', true);

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (city) {
      dbQuery = dbQuery.ilike('city', `%${city}%`);
    }

    if (maxPrice) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    if (parkingType) {
      dbQuery = dbQuery.eq('parking_type', parkingType);
    }

    if (availability) {
      dbQuery = dbQuery.eq('availability_status', availability);
    }

    const { data, error } = await dbQuery.range(offset, offset + limit - 1);

    if (error) {
      console.error('[Parking Search Error]', error);
      return apiError(res, 'Failed to search parking', 'DB_ERROR', 500);
    }

    // Apply in-memory filters that can't be done in SQL easily
    const filtered = applySearchFilters(data || [], {
      lat, lng, radius,
      vehicleType,
      evCharging,
      covered,
      security,
      accessible,
      is24h,
    });

    // Sort by distance if coordinates provided, else by rating
    const sorted = lat && lng
      ? filtered.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
      : filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return apiSuccess(res, { parking: sorted, total: sorted.length });
  } catch (err) {
    console.error('[Parking Search]', err);
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

// ── GET /api/parking/:id ───────────────────────────────────────────────────

export async function getParkingById(req: Request, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { data, error } = await supabaseAdmin
      .from('parking_locations')
      .select('*, parking_images(*)')
      .eq('id', paramResult.data.id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return apiError(res, 'Parking location not found', 'NOT_FOUND', 404);
    }

    return apiSuccess(res, data);
  } catch (err) {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

// ── POST /api/parking ──────────────────────────────────────────────────────

export async function createParking(req: AuthenticatedRequest, res: Response) {
  const bodyResult = ParkingCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('parking_locations')
      .insert({ ...bodyResult.data, owner_id: req.user!.id })
      .select()
      .single();

    if (error) {
      console.error('[Create Parking Error]', error);
      return apiError(res, 'Failed to create parking', 'DB_ERROR', 500);
    }

    return apiSuccess(res, data, 201);
  } catch (err) {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

// ── PATCH /api/parking/:id ────────────────────────────────────────────────

export async function updateParking(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = ParkingUpdateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    // Verify ownership (admin can edit any, operator only their own)
    const { data: existing } = await supabaseAdmin
      .from('parking_locations')
      .select('owner_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!existing) return apiError(res, 'Not found', 'NOT_FOUND', 404);

    if (req.user!.role !== 'admin' && existing.owner_id !== req.user!.id) {
      return apiError(res, 'Forbidden', 'FORBIDDEN', 403);
    }

    const { data, error } = await supabaseAdmin
      .from('parking_locations')
      .update({ ...bodyResult.data, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id)
      .select()
      .single();

    if (error) return apiError(res, 'Update failed', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch (err) {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

// ── DELETE /api/parking/:id (soft delete) ─────────────────────────────────

export async function deleteParking(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { data: existing } = await supabaseAdmin
      .from('parking_locations')
      .select('owner_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!existing) return apiError(res, 'Not found', 'NOT_FOUND', 404);

    if (req.user!.role !== 'admin' && existing.owner_id !== req.user!.id) {
      return apiError(res, 'Forbidden', 'FORBIDDEN', 403);
    }

    await supabaseAdmin
      .from('parking_locations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id);

    return apiSuccess(res, { message: 'Parking location deactivated' });
  } catch (err) {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
