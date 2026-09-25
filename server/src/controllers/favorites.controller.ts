import { Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { UUIDParamSchema } from '../schemas';

export async function getFavorites(req: AuthenticatedRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        id, created_at,
        parking_locations (
          id, name, address, city, latitude, longitude,
          parking_type, price, currency, pricing_unit,
          availability_status, rating, review_count, amenities, is_active
        )
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch favorites', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function addFavorite(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse({ id: req.params.parkingId });
  if (!paramResult.success) return apiError(res, 'Invalid parking ID', 'VALIDATION_ERROR', 400);

  try {
    // Verify parking exists
    const { data: parking } = await supabaseAdmin
      .from('parking_locations')
      .select('id')
      .eq('id', paramResult.data.id)
      .eq('is_active', true)
      .single();

    if (!parking) return apiError(res, 'Parking not found', 'NOT_FOUND', 404);

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({ user_id: req.user!.id, parking_id: paramResult.data.id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return apiError(res, 'Already in favorites', 'CONFLICT', 409);
      }
      return apiError(res, 'Failed to add favorite', 'DB_ERROR', 500);
    }

    return apiSuccess(res, data, 201);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function removeFavorite(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse({ id: req.params.parkingId });
  if (!paramResult.success) return apiError(res, 'Invalid parking ID', 'VALIDATION_ERROR', 400);

  try {
    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('parking_id', paramResult.data.id);

    if (error) return apiError(res, 'Failed to remove favorite', 'DB_ERROR', 500);

    return apiSuccess(res, { message: 'Removed from favorites' });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
