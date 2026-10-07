import { Router } from 'express';
import { CreatorController } from '../controllers/creator.controller.js';
import { PostController } from '../controllers/post.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All /api/creator/* routes strictly require authentication and CREATOR role
router.use(requireAuth, requireRole(UserRole.CREATOR));

// Profile management
router.get('/profile', CreatorController.getProfile);
router.patch('/profile', CreatorController.updateProfile);
router.get('/profile/completion', CreatorController.getCompletion);

// Dynamic skills management
router.get('/skills', CreatorController.getSkills);
router.post('/skills', CreatorController.addSkill);
router.patch('/skills/:skillId', CreatorController.updateSkill);
router.delete('/skills/:skillId', CreatorController.deleteSkill);

// Creator studio posts management
router.get('/posts', PostController.getCreatorPosts);

export const creatorRoutes = router;
