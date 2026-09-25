import { Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { SearchHistoryCreateSchema, UUIDParamSchema } from '../schemas';

export async function getHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('search_history')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return apiError(res, 'Failed to fetch history', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function saveHistory(req: AuthenticatedRequest, res: Response) {
  const bodyResult = SearchHistoryCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('search_history')
      .insert({ user_id: req.user!.id, ...bodyResult.data })
      .select()
      .single();

    if (error) return apiError(res, 'Failed to save history', 'DB_ERROR', 500);

    return apiSuccess(res, data, 201);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function deleteHistory(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  try {
    const { error } = await supabaseAdmin
      .from('search_history')
      .delete()
      .eq('id', paramResult.data.id)
      .eq('user_id', req.user!.id); // Ensures user can only delete their own history

    if (error) return apiError(res, 'Delete failed', 'DB_ERROR', 500);

    return apiSuccess(res, { message: 'History entry deleted' });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
