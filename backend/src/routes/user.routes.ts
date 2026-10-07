import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { InteractionController } from '../controllers/interaction.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// User profile endpoints require authentication
router.use(requireAuth);

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);

// Phase 4: Social graph & interactions
router.get('/saved', InteractionController.getSavedPosts);
router.get('/followers', InteractionController.getFollowers);
router.get('/following', InteractionController.getFollowing);

export const userRoutes = router;
