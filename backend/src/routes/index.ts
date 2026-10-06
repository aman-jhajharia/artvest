import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { onboardingRoutes } from './onboarding.routes.js';
import { TaxonomyController } from '../controllers/taxonomy.controller.js';

const router = Router();

// Mount modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);

// Taxonomy endpoints
router.get('/categories', TaxonomyController.getCategories);
router.get('/skills', TaxonomyController.getSkills);

export const apiRoutes = router;
