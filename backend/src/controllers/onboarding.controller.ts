import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '../services/onboarding.service.js';
import { UserOnboardingSchema, CreatorOnboardingSchema } from '../validators/onboarding.validator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class OnboardingController {
  /**
   * POST /api/onboarding/user
   * Completes onboarding for a common community member.
   */
  public static async onboardUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const parseResult = UserOnboardingSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError('Invalid user onboarding input', 'VALIDATION_ERROR', parseResult.error.flatten().fieldErrors)
        );
        return;
      }

      const result = await OnboardingService.completeUserOnboarding(req.user.id, parseResult.data);
      res.status(200).json(sendSuccess(result, 'User onboarding completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/onboarding/creator
   * Completes onboarding for a creator with structured role attributes.
   */
  public static async onboardCreator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const parseResult = CreatorOnboardingSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json(
          sendError('Invalid creator onboarding input', 'VALIDATION_ERROR', parseResult.error.flatten().fieldErrors)
        );
        return;
      }

      const result = await OnboardingService.completeCreatorOnboarding(req.user.id, parseResult.data);
      res.status(200).json(sendSuccess(result, 'Creator onboarding completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/onboarding/status
   * Checks onboarding status of the current user.
   */
  public static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const status = await OnboardingService.getOnboardingStatus(req.user.id);
      res.status(200).json(sendSuccess(status, 'Onboarding status retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
