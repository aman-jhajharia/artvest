import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service.js';
import {
  CreatePostSchema,
  UpdatePostSchema,
  FeedQuerySchema,
  CreatorPostsQuerySchema,
} from '../validators/post.validator.js';
import { AppError } from '../utils/apiResponse.js';

export class PostController {
  /**
   * Create a new showcase post or draft for the authenticated creator.
   * Creator ID is strictly derived from req.user.id.
   */
  public static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedInput = CreatePostSchema.parse(req.body);
      const post = await PostService.createPost(req.user.id, validatedInput);

      res.status(201).json({
        success: true,
        message: post.status === 'PUBLISHED' ? 'Post published successfully' : 'Draft created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve a single post by ID.
   * Increments view count on published posts.
   * Strictly restricts drafts to the author.
   */
  public static async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = String(req.params.postId);
      const requesterId = req.user?.id;

      const post = await PostService.getPostById(postId, requesterId);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing post.
   * Strictly enforces author ownership server-side.
   */
  public static async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const validatedInput = UpdatePostSchema.parse(req.body);

      const post = await PostService.updatePost(req.user.id, postId, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an existing post.
   * Strictly enforces author ownership.
   */
  public static async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      await PostService.deletePost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish a draft post.
   * Validates completeness according to postType before transitioning status.
   */
  public static async publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const post = await PostService.publishPost(req.user.id, postId);

      res.status(200).json({
        success: true,
        message: 'Post published to feed and portfolio successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set or unset featured status for a showcase post in creator portfolio.
   */
  public static async setFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const isFeatured = req.body.isFeatured !== false; // defaults to true for POST /feature

      const post = await PostService.setFeatured(req.user.id, postId, isFeatured);

      res.status(200).json({
        success: true,
        message: isFeatured ? 'Post featured on portfolio' : 'Post unfeatured from portfolio',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfeature a post (alias for DELETE /posts/:postId/feature)
   */
  public static async unfeature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const postId = String(req.params.postId);
      const post = await PostService.setFeatured(req.user.id, postId, false);

      res.status(200).json({
        success: true,
        message: 'Post unfeatured from portfolio',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List creator's own posts for Creator Studio (including Drafts, Published, Featured).
   */
  public static async getCreatorPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = CreatorPostsQuerySchema.parse(req.query);
      const result = await PostService.getCreatorPosts(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public endpoint to list published posts for a creator profile.
   * Drafts are strictly excluded.
   */
  public static async getPublicCreatorPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creatorId = String(req.params.creatorId);
      const validatedQuery = CreatorPostsQuerySchema.parse(req.query);
      const result = await PostService.getPublicCreatorPosts(creatorId, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chronological showcase feed endpoint.
   * Returns only PUBLISHED posts, with author profile, media, category, and skills.
   */
  public static async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = FeedQuerySchema.parse(req.query);
      const result = await PostService.getShowcaseFeed(validatedQuery);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
