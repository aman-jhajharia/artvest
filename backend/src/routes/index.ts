import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { onboardingRoutes } from './onboarding.routes.js';
import { creatorRoutes } from './creator.routes.js';
import { userRoutes } from './user.routes.js';
import { postRoutes } from './post.routes.js';
import { feedRoutes } from './feed.routes.js';
import { mediaRoutes } from './media.routes.js';
import { commentRoutes } from './comment.routes.js';
import { collaborationRoutes } from './collaboration.routes.js';
import { exploreRoutes } from './explore.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { studioRoutes } from './studio.routes.js';
import { TaxonomyController } from '../controllers/taxonomy.controller.js';
import { CreatorController } from '../controllers/creator.controller.js';
import { PostController } from '../controllers/post.controller.js';
import { InteractionController } from '../controllers/interaction.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Mount modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/creator', creatorRoutes);
router.use('/user', userRoutes);
router.use('/posts', postRoutes);
router.use('/feed', feedRoutes);
router.use('/media', mediaRoutes);
router.use('/comments', commentRoutes);
router.use('/collaboration', collaborationRoutes);
router.use('/explore', exploreRoutes);
router.use('/notifications', notificationRoutes);
router.use('/studio', studioRoutes);

// Public creator profile and showcase discovery
router.get('/creators/:creatorId', optionalAuth, CreatorController.getPublicProfile);
router.get('/creators/:creatorId/posts', optionalAuth, PostController.getPublicCreatorPosts);

// Creator Follow Graph
router.post('/creators/:creatorId/follow', requireAuth, InteractionController.followCreator);
router.delete('/creators/:creatorId/follow', requireAuth, InteractionController.unfollowCreator);

// Taxonomy endpoints
router.get('/categories', TaxonomyController.getCategories);
router.get('/skills', TaxonomyController.getSkills);

export const apiRoutes = router;
