import { Request, Response, NextFunction } from 'express';
import { MediaStorageService } from '../services/media.service.js';
import { AppError } from '../utils/apiResponse.js';
import { MediaType } from '@prisma/client';

export class MediaController {
  /**
   * Uploads a media file through the ArtVest API abstraction.
   * File is received in memory via multer and validated for MIME type, size, and magic headers.
   */
  public static async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded. Please provide a file under the "file" field.', 400, 'NO_FILE_PROVIDED');
      }

      const uploadedMedia = await MediaStorageService.uploadMedia(
        req.file.buffer,
        {
          mimetype: req.file.mimetype,
          size: req.file.size,
          originalname: req.file.originalname,
        },
        req.user?.id || 'anonymous'
      );

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: uploadedMedia,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates a secure, signed upload authorization payload for direct client upload
   * to Cloudinary without exposing API secrets to the browser.
   */
  public static async getUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signaturePayload = MediaStorageService.generateUploadSignature(req.user?.id || 'anonymous');

      res.status(200).json({
        success: true,
        data: signaturePayload,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a media asset from the storage provider by publicId.
   */
  public static async deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicId, mediaType } = req.body;
      if (!publicId) {
        throw new AppError('publicId is required to delete media', 400, 'MISSING_PUBLIC_ID');
      }

      await MediaStorageService.deleteMedia(publicId, mediaType || 'IMAGE');

      res.status(200).json({
        success: true,
        message: 'Media asset removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
