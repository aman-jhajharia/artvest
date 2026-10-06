import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/google', AuthController.googleAuth);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

export const authRoutes = router;
