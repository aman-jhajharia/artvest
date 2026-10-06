import { UserRole } from '@prisma/client';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'uninitialized';
  };
}

export interface AuthSessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
