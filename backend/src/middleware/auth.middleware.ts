import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { AuthSessionPayload, SafeUser } from '../types/index.js';
import { sendError } from '../utils/apiResponse.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Read session from HttpOnly cookie first, with Bearer header fallback
    let token = req.cookies?.[config.session.cookieName];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json(sendError('Authentication required to access this resource', 'UNAUTHORIZED'));
      return;
    }

    // Verify token
    let decoded: AuthSessionPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as AuthSessionPayload;
    } catch (jwtErr) {
      res.status(401).json(sendError('Invalid or expired authentication session', 'UNAUTHORIZED'));
      return;
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json(sendError('Account belonging to this session no longer exists', 'UNAUTHORIZED'));
      return;
    }

    req.user = user as SafeUser;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(
        sendError(
          `Access forbidden: Required role [${allowedRoles.join(', ')}] but user has role '${req.user.role}'`,
          'FORBIDDEN'
        )
      );
      return;
    }

    next();
  };
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[config.session.cookieName];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthSessionPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user as SafeUser;
      }
    } catch {
      // Ignored for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}
