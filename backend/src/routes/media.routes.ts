import { Router } from 'express';
import multer from 'multer';
import { MediaController } from '../controllers/media.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 105 * 1024 * 1024, // 105 MB max upload buffer
  },
});

// All media endpoints require authentication and CREATOR role
router.use(requireAuth, requireRole(UserRole.CREATOR));

// Upload a single media file through backend abstraction
router.post('/upload', upload.single('file'), MediaController.uploadFile);

// Get direct-upload signed authorization parameters
router.post('/upload-signature', MediaController.getUploadSignature);

// Delete an unassociated/stored media asset
router.delete('/', MediaController.deleteMedia);

export const mediaRoutes = router;
