import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { apiSuccess, apiError } from '../utils/helpers';
import { UUIDParamSchema } from '../schemas';
import { z } from 'zod';

export async function getAdminStats(req: Request, res: Response) {
  try {
    const [
      { count: totalUsers },
      { count: totalParking },
      { count: pendingReports },
      { count: totalReviews },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('parking_locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('parking_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }),
    ]);

    return apiSuccess(res, {
      totalUsers: totalUsers ?? 0,
      totalParking: totalParking ?? 0,
      pendingReports: pendingReports ?? 0,
      totalReviews: totalReviews ?? 0,
    });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function getAdminUsers(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch users', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function getAdminParking(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('parking_locations')
      .select('*, profiles (id, full_name, role)')
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch parking', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function getAdminReviews(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        profiles (id, full_name),
        parking_locations (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch reviews', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function moderateReview(req: Request, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = z.object({ is_approved: z.boolean() }).safeParse(req.body);
  if (!bodyResult.success) return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400);

  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ is_approved: bodyResult.data.is_approved, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id)
      .select()
      .single();

    if (error) return apiError(res, 'Update failed', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
