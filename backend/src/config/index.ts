import dotenv from 'dotenv';
import { CookieOptions } from 'express';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/artvest?schema=public',
  jwt: {
    secret: process.env.JWT_SECRET || 'artvest-dev-jwt-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  session: {
    cookieName: 'artvest_session',
    maxAgeDays: 7,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
} as const;

export function getSessionCookieOptions(envOverride?: string): CookieOptions {
  const isProduction = (envOverride ?? config.env) === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: config.session.maxAgeDays * 24 * 60 * 60 * 1000,
  };
}

export function getClearSessionCookieOptions(envOverride?: string): CookieOptions {
  const isProduction = (envOverride ?? config.env) === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}
