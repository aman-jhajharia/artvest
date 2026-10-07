import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Modifying comments strictly requires authentication and ownership validation
router.use(requireAuth);

router.patch('/:commentId', InteractionController.updateComment);
router.delete('/:commentId', InteractionController.deleteComment);

export const commentRoutes = router;
