import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/index.js';
import { apiRoutes } from './routes/index.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Trust first proxy (Render, Vercel, reverse proxies) for secure cookie recognition
  app.set('trust proxy', 1);

  // Security headers with media resource policy allowing cross-origin media playback
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Serve local media uploads statically for fallback/offline academic demonstration
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Cookie parsing for HttpOnly session cookies
  app.use(cookieParser());

  // Allowed CORS origins (sanitized of trailing slashes, strictly validated)
  const configuredOrigins = config.frontendUrl
    ? config.frontendUrl
        .split(',')
        .map((u) => u.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    : [];

  const allowedOrigins = Array.from(
    new Set([
      ...configuredOrigins,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ])
  );

  // CORS configuration with credentials support
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logging
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root welcome endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'ArtVest REST API Service',
      tagline: 'Discover Talent. Build Teams. Back Ideas.',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  // Mount API router
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use(notFoundMiddleware);

  // Error Handler
  app.use(errorMiddleware);

  return app;
}
