import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { ReviewCreateSchema, ReviewUpdateSchema, UUIDParamSchema } from '../schemas';

export async function getReviews(req: Request, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id, rating, review_text, is_approved, created_at, updated_at,
        profiles (id, full_name, avatar_url)
      `)
      .eq('parking_id', paramResult.data.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch reviews', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function createReview(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = ReviewCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

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
      .from('reviews')
      .insert({
        user_id: req.user!.id,
        parking_id: paramResult.data.id,
        ...bodyResult.data,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return apiError(res, 'You have already reviewed this parking location', 'CONFLICT', 409);
      }
      return apiError(res, 'Failed to submit review', 'DB_ERROR', 500);
    }

    // Update aggregate rating on parking
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('parking_id', paramResult.data.id)
      .eq('is_approved', true);

    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await supabaseAdmin
        .from('parking_locations')
        .update({
          rating: Math.round(avg * 10) / 10,
          review_count: reviews.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paramResult.data.id);
    }

    return apiSuccess(res, data, 201);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = ReviewUpdateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    // Verify ownership
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('user_id, parking_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!review) return apiError(res, 'Review not found', 'NOT_FOUND', 404);

    if (req.user!.role !== 'admin' && review.user_id !== req.user!.id) {
      return apiError(res, 'Forbidden', 'FORBIDDEN', 403);
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ ...bodyResult.data, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id)
      .select()
      .single();

    if (error) return apiError(res, 'Update failed', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('user_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!review) return apiError(res, 'Review not found', 'NOT_FOUND', 404);

    if (req.user!.role !== 'admin' && review.user_id !== req.user!.id) {
      return apiError(res, 'Forbidden', 'FORBIDDEN', 403);
    }

    await supabaseAdmin.from('reviews').delete().eq('id', paramResult.data.id);

    return apiSuccess(res, { message: 'Review deleted' });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
