import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class HealthController {
  public static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await HealthService.getHealthStatus();
      const httpStatus = health.status === 'healthy' ? 200 : 200; // 200 with degraded status allows uptime monitors to read diagnostics
      res.status(httpStatus).json(sendSuccess(health, 'ArtVest API service status'));
    } catch (error) {
      next(error);
    }
  }
}
