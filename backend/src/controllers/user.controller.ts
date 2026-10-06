import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { UpdateUserProfileSchema } from '../validators/user.validator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  /**
   * GET /api/user/profile
   * Retrieves profile for the authenticated user.
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const user = await UserService.getUserProfile(req.user.id);
      res.status(200).json(sendSuccess(user, 'User profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/user/profile
   * Updates standard user profile attributes.
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const parseResult = UpdateUserProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError(
            'Invalid user profile update data',
            'VALIDATION_ERROR',
            parseResult.error.flatten().fieldErrors
          )
        );
        return;
      }

      const updated = await UserService.updateUserProfile(req.user.id, parseResult.data);
      res.status(200).json(sendSuccess(updated, 'User profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
