import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// User profile endpoints require authentication
router.use(requireAuth);

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);

export const userRoutes = router;
