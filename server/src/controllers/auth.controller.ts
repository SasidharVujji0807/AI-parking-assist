import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { supabase } from '../db/supabase';

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    return apiSuccess(res, {
      user: { id: req.user!.id, email: req.user!.email, role: req.user!.role },
      profile,
    });
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const { full_name, avatar_url } = req.body;

  if (!full_name && !avatar_url) {
    return apiError(res, 'Nothing to update', 'VALIDATION_ERROR', 400);
  }

  try {
    const updates: Record<string, string> = {};
    if (full_name) updates.full_name = String(full_name).slice(0, 200);
    if (avatar_url) updates.avatar_url = String(avatar_url).slice(0, 2000);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) return apiError(res, 'Update failed', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
