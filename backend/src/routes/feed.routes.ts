import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Chronological showcase feed
router.get('/', optionalAuth, PostController.getFeed);

export const feedRoutes = router;
