import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import {
  CreateProjectSchema,
  InvestProjectSchema,
  ProjectQuerySchema,
} from '../validators/project.validator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class ProjectController {
  /**
   * GET /api/projects
   * Public list of creative projects with search, filter, and caller's holding.
   */
  public static async listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryValidation = ProjectQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json(
          sendError(
            'Invalid project query parameters',
            'VALIDATION_ERROR',
            queryValidation.error.flatten().fieldErrors
          )
        );
        return;
      }

      const result = await ProjectService.listProjects(queryValidation.data, req.user?.id);
      res.status(200).json(sendSuccess(result, 'Creative projects retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/projects/:id
   * Detailed project breakdown, live shareholder cap table, and caller's holding.
   */
  public static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.getProjectById(id, req.user?.id);
      res.status(200).json(sendSuccess(project, 'Project details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/projects
   * Creators only: Launch a new creative pitch.
   */
  public static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const bodyValidation = CreateProjectSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json(
          sendError(
            'Invalid project creation payload',
            'VALIDATION_ERROR',
            bodyValidation.error.flatten().fieldErrors
          )
        );
        return;
      }

      const project = await ProjectService.createProject(req.user.id, bodyValidation.data);
      res.status(201).json(sendSuccess(project, 'Creative project launched successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/projects/:id/invest
   * Back a project with demo ArtCredits in exchange for fractional shares.
   */
  public static async investInProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const id = req.params.id as string;
      const bodyValidation = InvestProjectSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json(
          sendError(
            'Investments must be in multiples of 500 ArtCredits',
            'INVALID_INVESTMENT_INCREMENT',
            bodyValidation.error.flatten().fieldErrors
          )
        );
        return;
      }

      const result = await ProjectService.investInProject(
        req.user.id,
        id,
        bodyValidation.data.amount
      );

      res.status(200).json(
        sendSuccess(
          result,
          `Successfully invested ${bodyValidation.data.amount} ArtCredits and acquired fractional shares!`
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
