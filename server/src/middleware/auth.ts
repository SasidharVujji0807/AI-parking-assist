import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import { supabaseAdmin } from '../db/supabase';
import { apiError } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return apiError(res, 'Missing authorization token', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return apiError(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
    }

    // Fetch user role from profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email ?? '',
      role: profile?.role ?? 'user',
    };

    next();
  } catch (err) {
    return apiError(res, 'Authentication failed', 'AUTH_ERROR', 500);
  }
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Proceed without user
  }

  authenticate(req, res, next);
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return apiError(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }
    if (!roles.includes(req.user.role)) {
      return apiError(res, 'Insufficient permissions', 'FORBIDDEN', 403);
    }
    next();
  };
}

export const requireAuth = authenticate;
export const requireOperator = [authenticate, requireRole('operator', 'admin')];
export const requireAdmin = [authenticate, requireRole('admin')];
