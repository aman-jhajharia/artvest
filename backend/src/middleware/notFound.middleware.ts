import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json(
    sendError(`Cannot ${req.method} ${req.originalUrl} - Route not found`, 'NOT_FOUND')
  );
}
