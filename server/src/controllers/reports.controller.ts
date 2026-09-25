import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthenticatedRequest } from '../middleware/auth';
import { apiSuccess, apiError } from '../utils/helpers';
import { ReportCreateSchema, UUIDParamSchema } from '../schemas';
import { z } from 'zod';

export async function createReport(req: AuthenticatedRequest, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = ReportCreateSchema.safeParse(req.body);
  if (!bodyResult.success) {
    return apiError(res, 'Invalid request', 'VALIDATION_ERROR', 400, bodyResult.error.flatten().fieldErrors);
  }

  try {
    const { data: parking } = await supabaseAdmin
      .from('parking_locations')
      .select('id')
      .eq('id', paramResult.data.id)
      .single();

    if (!parking) return apiError(res, 'Parking not found', 'NOT_FOUND', 404);

    const { data, error } = await supabaseAdmin
      .from('parking_reports')
      .insert({
        user_id: req.user?.id ?? null,
        parking_id: paramResult.data.id,
        ...bodyResult.data,
      })
      .select()
      .single();

    if (error) return apiError(res, 'Failed to submit report', 'DB_ERROR', 500);

    return apiSuccess(res, data, 201);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function getAdminReports(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('parking_reports')
      .select(`
        *,
        parking_locations (id, name, address),
        profiles (id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) return apiError(res, 'Failed to fetch reports', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}

export async function updateReportStatus(req: Request, res: Response) {
  const paramResult = UUIDParamSchema.safeParse(req.params);
  if (!paramResult.success) return apiError(res, 'Invalid ID', 'VALIDATION_ERROR', 400);

  const bodyResult = z.object({
    status: z.enum(['pending', 'reviewed', 'resolved', 'rejected']),
  }).safeParse(req.body);

  if (!bodyResult.success) {
    return apiError(res, 'Invalid status', 'VALIDATION_ERROR', 400);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('parking_reports')
      .update({ status: bodyResult.data.status, updated_at: new Date().toISOString() })
      .eq('id', paramResult.data.id)
      .select()
      .single();

    if (error) return apiError(res, 'Update failed', 'DB_ERROR', 500);

    return apiSuccess(res, data);
  } catch {
    return apiError(res, 'Internal error', 'INTERNAL_ERROR', 500);
  }
}
