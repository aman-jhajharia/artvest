import { Router } from 'express';
import { StudioController } from '../controllers/studio.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All Studio routes require authentication and CREATOR role
router.use(requireAuth, requireRole(UserRole.CREATOR));

router.get('/overview', StudioController.getOverview);
router.get('/posts', StudioController.getPostsPerformance);

export const studioRoutes = router;
