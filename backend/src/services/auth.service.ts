import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { AuthSessionPayload, SafeUser } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const googleClient = new OAuth2Client(config.google.clientId);

export interface GoogleAuthResult {
  user: SafeUser;
  token: string;
  isNewUser: boolean;
}

export class AuthService {
  /**
   * Cryptographically verifies Google ID Token or allows deterministic mock token in non-production test mode.
   */
  public static async verifyGoogleIdentity(credential: string): Promise<{
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }> {
    // Check for test / development mock credential in non-production
    if (config.env !== 'production' && credential.startsWith('mock_test_credential:')) {
      try {
        const rawJson = credential.replace('mock_test_credential:', '');
        const parsed = JSON.parse(rawJson);
        return {
          googleId: parsed.googleId || `mock_google_id_${Date.now()}`,
          email: parsed.email.toLowerCase(),
          name: parsed.name || 'Test User',
          avatarUrl: parsed.avatarUrl || null,
        };
      } catch (err) {
        throw new AppError('Invalid mock test credential payload', 400, 'INVALID_CREDENTIAL');
      }
    }

    if (!config.google.clientId) {
      // In local dev without Google OAuth client credentials configured, provide informative warning
      if (config.env === 'development') {
        throw new AppError(
          'GOOGLE_CLIENT_ID is not configured in backend .env. For local automated testing, use a mock token or configure Google OAuth credentials.',
          400,
          'GOOGLE_OAUTH_NOT_CONFIGURED'
        );
      }
      throw new AppError('Google OAuth is not configured on this server', 500, 'CONFIG_ERROR');
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError('Google ID token did not contain valid profile information', 400, 'INVALID_ID_TOKEN');
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture || null,
      };
    } catch (err) {
      logger.warn('Google token verification failed:', err instanceof Error ? err.message : err);
      throw new AppError('Failed to verify Google identity credential', 401, 'INVALID_GOOGLE_CREDENTIAL');
    }
  }

  /**
   * Authenticates or registers a user via verified Google identity and generates a session JWT.
   */
  public static async authenticateGoogleUser(credential: string): Promise<GoogleAuthResult> {
    const googleProfile = await this.verifyGoogleIdentity(credential);

    // Find existing user by googleId first, or by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleProfile.googleId },
          { email: googleProfile.email },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      // Register new user with default USER role and isOnboarded=false
      user = await prisma.user.create({
        data: {
          googleId: googleProfile.googleId,
          email: googleProfile.email,
          name: googleProfile.name,
          avatarUrl: googleProfile.avatarUrl,
          role: UserRole.USER,
          isOnboarded: false,
        },
      });
      isNewUser = true;
      logger.info(`Created new user account for: ${user.email} (ID: ${user.id})`);
    } else {
      // If user existed by email but didn't have googleId linked, link it now
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleProfile.googleId,
            avatarUrl: user.avatarUrl || googleProfile.avatarUrl,
          },
        });
      }
      logger.info(`Existing user logged in: ${user.email} (ID: ${user.id})`);
    }

    // Generate JWT session token
    const token = this.generateSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
      isNewUser,
    };
  }

  /**
   * Signs a JWT session token with environment-configured secret.
   */
  public static generateSessionToken(payload: AuthSessionPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn as any,
      }
    );
  }

  /**
   * Retrieves full profile details for the authenticated user.
   */
  public static async getAuthenticatedUserWithProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        creatorProfile: {
          include: {
            primaryCategory: true,
            creatorSkills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}
