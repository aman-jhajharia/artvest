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

  // CORS configuration with credentials support
  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
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
