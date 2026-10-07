import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Collaboration inquiry actions strictly require authentication
router.use(requireAuth);

router.post('/inquiries', InteractionController.createInquiry);
router.get('/inquiries/sent', InteractionController.getSentInquiries);
router.get('/inquiries/received', InteractionController.getReceivedInquiries);
router.patch('/inquiries/:id', InteractionController.updateInquiryStatus);

export const collaborationRoutes = router;
