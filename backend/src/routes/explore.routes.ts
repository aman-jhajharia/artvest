import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// High-level overview
router.get('/', optionalAuth, ExploreController.getOverview);

// Structured creator talent discovery
router.get('/creators', optionalAuth, ExploreController.exploreCreators);

// Showcase work discovery
router.get('/posts', optionalAuth, ExploreController.explorePosts);

export const exploreRoutes = router;
