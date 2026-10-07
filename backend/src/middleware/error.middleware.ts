import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  logger.error('Unhandled request error:', err.message, err.stack);

  if (err instanceof ZodError) {
    return res.status(400).json(
      sendError(
        'Validation failed',
        'VALIDATION_ERROR',
        err.flatten().fieldErrors
      )
    );
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      sendError(err.message, err.code, err.details)
    );
  }

  // Handle generic error
  const isProduction = config.env === 'production';
  return res.status(500).json(
    sendError(
      isProduction ? 'Internal server error occurred' : err.message,
      'INTERNAL_SERVER_ERROR',
      isProduction ? undefined : { stack: err.stack }
    )
  );
}
