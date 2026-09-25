import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { ParkingCreateSchema, ParkingUpdateSchema, UUIDParamSchema } from '../schemas';

// Operator sees only their own parking

export async function getOperatorParking(req: AuthenticatedRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('parking_locations')
      .select('*')
      .eq('owner_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch parking', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function createOperatorParking(req: AuthenticatedRequest, res: Response) {
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

    if (error) return apiError(res, 'Failed to create parking', 'DB_ERROR', 500);

    return apiSuccess(res, data, 201);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function updateOperatorParking(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = ParkingCreateSchema.partial().safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    // Strict ownership check
    const { data: existing } = await supabaseAdmin
      .from('parking_locations')
      .select('owner_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!existing) return apiError(res, 'Not found', 'NOT_FOUND', 404);
    if (existing.owner_id !== req.user!.id) return apiError(res, 'Forbidden', 'FORBIDDEN', 403);

    const { data, error } = await supabaseAdmin
      .from('parking_locations')
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

export async function deleteOperatorParking(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { data: existing } = await supabaseAdmin
      .from('parking_locations')
      .select('owner_id')
      .eq('id', paramResult.data.id)
      .single();

    if (!existing) return apiError(res, 'Not found', 'NOT_FOUND', 404);
    if (existing.owner_id !== req.user!.id) return apiError(res, 'Forbidden', 'FORBIDDEN', 403);

    await supabaseAdmin
      .from('parking_locations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id);

    return apiSuccess(res, { message: 'Parking deactivated' });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
