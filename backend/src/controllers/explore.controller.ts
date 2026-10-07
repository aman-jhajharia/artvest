import { Request, Response, NextFunction } from 'express';
import { ExploreService } from '../services/explore.service.js';
import {
  CreatorExploreQuerySchema,
  PostExploreQuerySchema,
  ExploreOverviewQuerySchema,
} from '../validators/explore.validator.js';

export class ExploreController {
  /**
   * GET /api/explore/creators
   * Explores and discovers publicly listed creators using multi-attribute filters.
   */
  public static async exploreCreators(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = CreatorExploreQuerySchema.parse(req.query);
      const result = await ExploreService.exploreCreators(validatedQuery, req.user?.id);

      res.status(200).json({
        success: true,
        data: result.creators,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/explore/posts
   * Discovers published creative showcase posts with multi-attribute criteria.
   */
  public static async explorePosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = PostExploreQuerySchema.parse(req.query);
      const result = await ExploreService.explorePosts(validatedQuery, req.user?.id);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/explore
   * High-level discovery overview combining featured creators, showcases, and active taxonomy.
   */
  public static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = ExploreOverviewQuerySchema.parse(req.query);
      const result = await ExploreService.getExploreOverview(validatedQuery, req.user?.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
