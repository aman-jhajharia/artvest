import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/user', requireAuth, OnboardingController.onboardUser);
router.post('/creator', requireAuth, OnboardingController.onboardCreator);
router.get('/status', requireAuth, OnboardingController.getStatus);

export const onboardingRoutes = router;
