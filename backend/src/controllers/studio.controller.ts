import { Request, Response, NextFunction } from 'express';
import { StudioService } from '../services/studio.service.js';
import { StudioPostsQuerySchema } from '../validators/studio.validator.js';
import { AppError } from '../utils/apiResponse.js';

export class StudioController {
  /**
   * GET /api/studio/overview
   * Returns aggregated real performance metrics for the authenticated creator.
   */
  public static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const overview = await StudioService.getStudioOverview(req.user.id);

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/studio/posts
   * Returns creator posts with engagement performance metrics and sorting.
   */
  public static async getPostsPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = StudioPostsQuerySchema.parse(req.query);
      const result = await StudioService.getStudioPostsPerformance(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
