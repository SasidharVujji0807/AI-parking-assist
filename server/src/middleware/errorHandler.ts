import { Request, Response, NextFunction } from 'express';
import { apiError } from '../utils/helpers';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error]', err.message, err.stack);
  return apiError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
}

export function notFound(req: Request, res: Response) {
  return apiError(res, `Route ${req.originalUrl} not found`, 'NOT_FOUND', 404);
}
