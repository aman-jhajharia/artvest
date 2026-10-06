import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getSessionCookieOptions, config } from '../config/index.js';

export class AuthController {
  /**
   * POST /api/auth/google
   * Verifies Google token, creates/finds user, establishes HttpOnly cookie session.
   */
  public static async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential, idToken } = req.body;
      const tokenToVerify = credential || idToken;

      if (!tokenToVerify || typeof tokenToVerify !== 'string') {
        res.status(400).json(sendError('Google authentication credential is required', 'MISSING_CREDENTIAL'));
        return;
      }

      const result = await AuthService.authenticateGoogleUser(tokenToVerify);

      // Set HttpOnly session cookie
      res.cookie(config.session.cookieName, result.token, getSessionCookieOptions());

      res.status(result.isNewUser ? 201 : 200).json(
        sendSuccess(
          {
            user: result.user,
            isNewUser: result.isNewUser,
          },
          result.isNewUser ? 'User registered and authenticated' : 'Authentication successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Clears session cookie.
   */
  public static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(config.session.cookieName, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'strict' : 'lax',
        path: '/',
      });

      res.status(200).json(sendSuccess(null, 'Successfully logged out'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Returns current authenticated user and their active profile status.
   */
  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Unauthenticated', 'UNAUTHORIZED'));
        return;
      }

      const userWithProfile = await AuthService.getAuthenticatedUserWithProfile(req.user.id);
      res.status(200).json(sendSuccess(userWithProfile, 'Current authenticated account details'));
    } catch (error) {
      next(error);
    }
  }
}
