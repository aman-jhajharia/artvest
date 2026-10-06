import { Request, Response, NextFunction } from 'express';
import { CreatorService } from '../services/creator.service.js';
import {
  UpdateCreatorProfileSchema,
  AddCreatorSkillSchema,
  UpdateCreatorSkillSchema,
} from '../validators/creator.validator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class CreatorController {
  /**
   * GET /api/creator/profile
   * Retrieves full profile and completion breakdown for authenticated creator.
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const profile = await CreatorService.getCreatorProfileByUserId(req.user.id);
      res.status(200).json(sendSuccess(profile, 'Creator profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/creator/profile
   * Partially updates creator profile attributes and recalculates completion score.
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const parseResult = UpdateCreatorProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError(
            'Invalid profile update data',
            'VALIDATION_ERROR',
            parseResult.error.flatten().fieldErrors
          )
        );
        return;
      }

      const updated = await CreatorService.updateCreatorProfile(req.user.id, parseResult.data);
      res.status(200).json(sendSuccess(updated, 'Creator profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/creator/skills
   * Retrieves skills list for authenticated creator.
   */
  public static async getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const skills = await CreatorService.getCreatorSkills(req.user.id);
      res.status(200).json(sendSuccess(skills, 'Creator skills retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/creator/skills
   * Adds a skill to the creator's profile.
   */
  public static async addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const parseResult = AddCreatorSkillSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError(
            'Invalid skill data',
            'VALIDATION_ERROR',
            parseResult.error.flatten().fieldErrors
          )
        );
        return;
      }

      const skill = await CreatorService.addCreatorSkill(req.user.id, parseResult.data);
      res.status(201).json(sendSuccess(skill, 'Skill added to creator profile successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/creator/skills/:skillId
   * Updates an existing creator skill's proficiency, primary flag, or years of experience.
   */
  public static async updateSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const skillId = String(req.params.skillId);
      if (!skillId) {
        res.status(400).json(sendError('Skill ID parameter is required', 'INVALID_PARAM'));
        return;
      }

      const parseResult = UpdateCreatorSkillSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError(
            'Invalid skill update data',
            'VALIDATION_ERROR',
            parseResult.error.flatten().fieldErrors
          )
        );
        return;
      }

      const updated = await CreatorService.updateCreatorSkill(req.user.id, skillId, parseResult.data);
      res.status(200).json(sendSuccess(updated, 'Creator skill updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/creator/skills/:skillId
   * Removes a secondary skill from creator profile.
   */
  public static async deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const skillId = String(req.params.skillId);
      if (!skillId) {
        res.status(400).json(sendError('Skill ID parameter is required', 'INVALID_PARAM'));
        return;
      }

      const result = await CreatorService.deleteCreatorSkill(req.user.id, skillId);
      res.status(200).json(sendSuccess(result, 'Skill removed from creator profile'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/creator/profile/completion
   * Retrieves deterministic profile completion score and missing item checklist.
   */
  public static async getCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const breakdown = await CreatorService.getProfileCompletion(req.user.id);
      res.status(200).json(sendSuccess(breakdown, 'Profile completion breakdown retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/creators/:creatorId
   * Public creator profile endpoint (respects isPublic flag).
   */
  public static async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creatorId = String(req.params.creatorId);
      if (!creatorId) {
        res.status(400).json(sendError('Creator identifier parameter is required', 'INVALID_PARAM'));
        return;
      }

      const publicProfile = await CreatorService.getPublicCreatorProfile(creatorId, req.user?.id);
      res.status(200).json(sendSuccess(publicProfile, 'Public creator profile retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
