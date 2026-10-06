import { Request, Response, NextFunction } from 'express';
import { TaxonomyService } from '../services/taxonomy.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class TaxonomyController {
  public static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await TaxonomyService.getAllCategories();
      res.status(200).json(sendSuccess(categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
      const categorySlug = typeof req.query.categorySlug === 'string' ? req.query.categorySlug : undefined;

      const skills = await TaxonomyService.getSkills(categoryId, categorySlug);
      res.status(200).json(sendSuccess(skills, 'Skills retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
