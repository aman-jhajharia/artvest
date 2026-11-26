import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public / optional auth listing & details
router.get('/', optionalAuth, ProjectController.listProjects);
router.get('/:id', optionalAuth, ProjectController.getProjectById);

// Protected creator creation
router.post('/', requireAuth, requireRole(UserRole.CREATOR), ProjectController.createProject);

// Protected fractional investment
router.post('/:id/invest', requireAuth, ProjectController.investInProject);

export const projectRoutes = router;
