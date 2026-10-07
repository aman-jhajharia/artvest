import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { InteractionController } from '../controllers/interaction.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Create new post or draft (CREATOR only)
router.post('/', requireAuth, requireRole(UserRole.CREATOR), PostController.createPost);

// Get single post (Drafts restricted to author, published public)
router.get('/:postId', optionalAuth, PostController.getPost);

// Update post (CREATOR only, author ownership strictly enforced)
router.patch('/:postId', requireAuth, requireRole(UserRole.CREATOR), PostController.updatePost);

// Delete post (CREATOR only, author ownership strictly enforced)
router.delete('/:postId', requireAuth, requireRole(UserRole.CREATOR), PostController.deletePost);

// Publish post (CREATOR only)
router.post('/:postId/publish', requireAuth, requireRole(UserRole.CREATOR), PostController.publishPost);

// Feature / Unfeature in creator showcase portfolio
router.post('/:postId/feature', requireAuth, requireRole(UserRole.CREATOR), PostController.setFeatured);
router.delete('/:postId/feature', requireAuth, requireRole(UserRole.CREATOR), PostController.unfeature);

// ==========================================
// Phase 4: Social Interactions on Posts
// ==========================================

// Likes
router.post('/:postId/like', requireAuth, InteractionController.likePost);
router.delete('/:postId/like', requireAuth, InteractionController.unlikePost);
router.get('/:postId/likes', optionalAuth, InteractionController.getLikes);

// Saves / Bookmarks
router.post('/:postId/save', requireAuth, InteractionController.savePost);
router.delete('/:postId/save', requireAuth, InteractionController.unsavePost);

// Comments
router.post('/:postId/comments', requireAuth, InteractionController.createComment);
router.get('/:postId/comments', optionalAuth, InteractionController.getComments);

export const postRoutes = router;
