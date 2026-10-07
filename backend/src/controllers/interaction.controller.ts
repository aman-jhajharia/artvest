import { Request, Response, NextFunction } from 'express';
import { InteractionService } from '../services/interaction.service.js';
import {
  CreateCommentSchema,
  UpdateCommentSchema,
  CommentsQuerySchema,
  SavedPostsQuerySchema,
  FollowQuerySchema,
  CreateInquirySchema,
  UpdateInquiryStatusSchema,
  InquiriesQuerySchema,
} from '../validators/interaction.validator.js';
import { AppError } from '../utils/apiResponse.js';

export class InteractionController {
  // ==========================================
  // 1. POST LIKES
  // ==========================================

  public static async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const result = await InteractionService.likePost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post appreciated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const result = await InteractionService.unlikePost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post appreciation removed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getLikes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const result = await InteractionService.getPostLikes(postId, req.user?.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. SAVED POSTS (BOOKMARKS)
  // ==========================================

  public static async savePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const result = await InteractionService.savePost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post saved to bookmarks',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async unsavePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const result = await InteractionService.unsavePost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post removed from saved bookmarks',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSavedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = SavedPostsQuerySchema.parse(req.query);
      const result = await InteractionService.getUserSavedPosts(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 3. COMMENTS & NESTED REPLIES
  // ==========================================

  public static async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const validatedInput = CreateCommentSchema.parse(req.body);
      const comment = await InteractionService.createComment(req.user.id, postId, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Comment published successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const validatedQuery = CommentsQuerySchema.parse(req.query);
      const result = await InteractionService.getPostComments(postId, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.comments,
        totalComments: result.totalComments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const commentId = String(req.params.commentId);
      const validatedInput = UpdateCommentSchema.parse(req.body);
      const comment = await InteractionService.updateComment(req.user.id, commentId, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const commentId = String(req.params.commentId);
      const result = await InteractionService.deleteComment(req.user.id, commentId, req.user.role);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 4. CREATOR FOLLOW GRAPH
  // ==========================================

  public static async followCreator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const creatorId = String(req.params.creatorId);
      const result = await InteractionService.followCreator(req.user.id, creatorId);

      res.status(200).json({
        success: true,
        message: 'Creator followed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async unfollowCreator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const creatorId = String(req.params.creatorId);
      const result = await InteractionService.unfollowCreator(req.user.id, creatorId);

      res.status(200).json({
        success: true,
        message: 'Creator unfollowed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetIdentifier = (req.query.userId as string) || req.user?.id;
      if (!targetIdentifier) {
        throw new AppError('Target user or creator identifier is required', 400, 'IDENTIFIER_REQUIRED');
      }

      const validatedQuery = FollowQuerySchema.parse(req.query);
      const result = await InteractionService.getUserFollowers(targetIdentifier, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.followers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetIdentifier = (req.query.userId as string) || req.user?.id;
      if (!targetIdentifier) {
        throw new AppError('Target user or creator identifier is required', 400, 'IDENTIFIER_REQUIRED');
      }

      const validatedQuery = FollowQuerySchema.parse(req.query);
      const result = await InteractionService.getUserFollowing(targetIdentifier, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.following,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 5. COLLABORATION INQUIRIES
  // ==========================================

  public static async createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedInput = CreateInquirySchema.parse(req.body);
      const inquiry = await InteractionService.createInquiry(req.user.id, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Collaboration inquiry sent successfully',
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSentInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = InquiriesQuerySchema.parse(req.query);
      const result = await InteractionService.getSentInquiries(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.inquiries,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getReceivedInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = InquiriesQuerySchema.parse(req.query);
      const result = await InteractionService.getReceivedInquiries(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.inquiries,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateInquiryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const inquiryId = String(req.params.id);
      const validatedInput = UpdateInquiryStatusSchema.parse(req.body);
      const inquiry = await InteractionService.updateInquiryStatus(
        req.user.id,
        inquiryId,
        validatedInput.status
      );

      res.status(200).json({
        success: true,
        message: `Collaboration inquiry status updated to ${validatedInput.status.toLowerCase()}`,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }
}
