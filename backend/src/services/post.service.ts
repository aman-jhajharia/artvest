import { PostStatus, PostType, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import {
  CreatePostInput,
  UpdatePostInput,
  FeedQueryInput,
  CreatorPostsQueryInput,
  validatePostForPublishing,
} from '../validators/post.validator.js';

export class PostService {
  /**
   * Creates a new creative post or draft associated with the authenticated creator.
   */
  public static async createPost(userId: string, input: CreatePostInput) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      select: { id: true, primaryCategoryId: true },
    });

    if (!creator) {
      throw new AppError(
        'A Creator Profile is required to author creative showcases and portfolio works.',
        403,
        'CREATOR_PROFILE_REQUIRED'
      );
    }

    // Default categoryId to creator's primary category if not specified
    const categoryId = input.categoryId || creator.primaryCategoryId;

    // If publishing immediately, validate post completeness
    if (input.status === PostStatus.PUBLISHED) {
      const validation = validatePostForPublishing({
        title: input.title,
        caption: input.caption,
        categoryId,
        postType: input.postType,
        media: input.media,
      });

      if (!validation.isValid) {
        throw new AppError(
          `Cannot publish incomplete post: ${validation.errors.join(' ')}`,
          400,
          'CANNOT_PUBLISH_INCOMPLETE_POST',
          validation.errors
        );
      }
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        throw new AppError('Specified category does not exist in taxonomy', 400, 'INVALID_CATEGORY');
      }
    }

    // Verify skills exist if provided
    if (input.skillIds && input.skillIds.length > 0) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: input.skillIds } },
        select: { id: true },
      });
      if (foundSkills.length !== input.skillIds.length) {
        throw new AppError('One or more selected skills do not exist', 400, 'INVALID_SKILLS');
      }
    }

    return prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          authorId: userId,
          creatorProfileId: creator.id,
          title: input.title || null,
          caption: input.caption,
          description: input.description || null,
          postType: input.postType,
          status: input.status,
          categoryId,
          tags: input.tags,
          isFeatured: input.isFeatured,
          publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
          skills: input.skillIds.length > 0 ? { connect: input.skillIds.map((id) => ({ id })) } : undefined,
          media: {
            create: input.media.map((m, index) => ({
              mediaType: m.mediaType,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl || null,
              aspectRatio: m.aspectRatio || null,
              duration: m.duration || null,
              orderIndex: m.orderIndex ?? index,
              mimeType: m.mimeType || null,
              fileSize: m.fileSize || null,
              width: m.width || null,
              height: m.height || null,
              meta: m.meta ? (m.meta as Prisma.InputJsonValue) : undefined,
            })),
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
            },
          },
          creatorProfile: {
            select: {
              id: true,
              stageName: true,
              headline: true,
              location: true,
              primaryCategory: true,
            },
          },
          category: true,
          skills: true,
          media: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return post;
    });
  }

  /**
   * Transforms post with interaction metrics and current viewer states.
   */
  public static formatPostWithInteractions(post: any, currentUserId?: string) {
    const { likes, saves, _count, author, ...rest } = post;
    const authorFollowers = author?.followers;
    const { followers, ...cleanAuthor } = author || {};

    return {
      ...rest,
      author: author ? cleanAuthor : undefined,
      likeCount: _count?.likes ?? 0,
      commentCount: _count?.comments ?? 0,
      saveCount: _count?.saves ?? 0,
      likedByMe: Boolean(currentUserId && Array.isArray(likes) && likes.length > 0),
      savedByMe: Boolean(currentUserId && Array.isArray(saves) && saves.length > 0),
      followingCreator: Boolean(currentUserId && Array.isArray(authorFollowers) && authorFollowers.length > 0),
    };
  }

  /**
   * Retrieves single post by ID. Enforces draft privacy (only author can view drafts).
   */
  public static async getPostById(postId: string, requesterUserId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            followers: requesterUserId
              ? {
                  where: { followerId: requesterUserId },
                  select: { id: true },
                }
              : false,
          },
        },
        creatorProfile: {
          select: {
            id: true,
            stageName: true,
            headline: true,
            location: true,
            primaryCategory: true,
          },
        },
        category: true,
        skills: true,
        media: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
          },
        },
        likes: requesterUserId
          ? {
              where: { userId: requesterUserId },
              select: { id: true },
            }
          : false,
        saves: requesterUserId
          ? {
              where: { userId: requesterUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    // Draft privacy enforcement
    if (post.status === PostStatus.DRAFT && post.authorId !== requesterUserId) {
      throw new AppError('This post draft is private to its author.', 403, 'DRAFT_PRIVATE');
    }

    // Fire and forget view increment for published posts
    if (post.status === PostStatus.PUBLISHED) {
      await prisma.post
        .update({
          where: { id: postId },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    return this.formatPostWithInteractions(post, requesterUserId);
  }

  /**
   * Partially updates a post. Enforces strict creator ownership.
   */
  public static async updatePost(userId: string, postId: string, input: UpdatePostInput) {
    const existing = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!existing) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    // Strict ownership check
    if (existing.authorId !== userId) {
      throw new AppError('You do not have permission to modify this post.', 403, 'FORBIDDEN_POST_MUTATION');
    }

    // Validate category if updating
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const catExists = await prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!catExists) {
        throw new AppError('Specified category does not exist in taxonomy', 400, 'INVALID_CATEGORY');
      }
    }

    // Validate skills if updating
    if (input.skillIds) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: input.skillIds } },
        select: { id: true },
      });
      if (foundSkills.length !== input.skillIds.length) {
        throw new AppError('One or more selected skills do not exist', 400, 'INVALID_SKILLS');
      }
    }

    return prisma.$transaction(async (tx) => {
      // If new media array is supplied, replace existing media
      if (input.media !== undefined) {
        await tx.postMedia.deleteMany({ where: { postId } });
        if (input.media.length > 0) {
          await tx.postMedia.createMany({
            data: input.media.map((m, index) => ({
              postId,
              mediaType: m.mediaType,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl || null,
              aspectRatio: m.aspectRatio || null,
              duration: m.duration || null,
              orderIndex: m.orderIndex ?? index,
              mimeType: m.mimeType || null,
              fileSize: m.fileSize || null,
              width: m.width || null,
              height: m.height || null,
              meta: m.meta ? (m.meta as Prisma.InputJsonValue) : undefined,
            })),
          });
        }
      }

      // Update Post
      const updated = await tx.post.update({
        where: { id: postId },
        data: {
          title: input.title !== undefined ? input.title : undefined,
          caption: input.caption !== undefined ? input.caption : undefined,
          description: input.description !== undefined ? input.description : undefined,
          postType: input.postType,
          categoryId: input.categoryId !== undefined ? input.categoryId : undefined,
          tags: input.tags,
          isFeatured: input.isFeatured,
          skills:
            input.skillIds !== undefined
              ? { set: input.skillIds.map((id) => ({ id })) }
              : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
            },
          },
          creatorProfile: {
            select: {
              id: true,
              stageName: true,
              headline: true,
              location: true,
              primaryCategory: true,
            },
          },
          category: true,
          skills: true,
          media: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return updated;
    });
  }

  /**
   * Deletes a post. Enforces strict creator ownership.
   */
  public static async deletePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.authorId !== userId) {
      throw new AppError('You do not have permission to delete this post.', 403, 'FORBIDDEN_POST_MUTATION');
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return { deletedPostId: postId };
  }

  /**
   * Publishes a draft post after validating all publishing requirements.
   */
  public static async publishPost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.authorId !== userId) {
      throw new AppError('You do not have permission to publish this post.', 403, 'FORBIDDEN_POST_MUTATION');
    }

    if (post.status === PostStatus.PUBLISHED) {
      return post; // Already published
    }

    const validation = validatePostForPublishing({
      title: post.title,
      caption: post.caption,
      categoryId: post.categoryId,
      postType: post.postType,
      media: post.media,
    });

    if (!validation.isValid) {
      throw new AppError(
        `Cannot publish incomplete post: ${validation.errors.join(' ')}`,
        400,
        'CANNOT_PUBLISH_INCOMPLETE_POST',
        validation.errors
      );
    }

    return prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        creatorProfile: {
          select: {
            id: true,
            stageName: true,
            headline: true,
            location: true,
            primaryCategory: true,
          },
        },
        category: true,
        skills: true,
        media: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Sets or unsets the isFeatured flag on a post (author only).
   */
  public static async setFeatured(userId: string, postId: string, isFeatured: boolean) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.authorId !== userId) {
      throw new AppError('You do not have permission to modify this post.', 403, 'FORBIDDEN_POST_MUTATION');
    }

    return prisma.post.update({
      where: { id: postId },
      data: { isFeatured },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        creatorProfile: {
          select: {
            id: true,
            stageName: true,
            headline: true,
            location: true,
            primaryCategory: true,
          },
        },
        category: true,
        skills: true,
        media: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Retrieves authenticated creator's posts with filtering by status and isFeatured.
   */
  public static async getCreatorPosts(userId: string, query: CreatorPostsQueryInput) {
    const whereClause: Prisma.PostWhereInput = {
      authorId: userId,
    };

    if (query.status !== 'ALL') {
      whereClause.status = query.status as PostStatus;
    }

    if (query.isFeatured !== undefined) {
      whereClause.isFeatured = query.isFeatured;
    }

    const skip = (query.page - 1) * query.limit;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          category: true,
          skills: true,
          media: {
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              saves: true,
            },
          },
          likes: {
            where: { userId },
            select: { id: true },
          },
          saves: {
            where: { userId },
            select: { id: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map((p) => this.formatPostWithInteractions(p, userId)),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + posts.length < totalCount,
      },
    };
  }

  /**
   * Retrieves public creator's published posts (excludes drafts).
   */
  public static async getPublicCreatorPosts(
    identifier: string,
    query: { page?: number; limit?: number } = {},
    requesterUserId?: string
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const creator = await prisma.creatorProfile.findFirst({
      where: {
        OR: [{ id: identifier }, { userId: identifier }],
      },
      select: { userId: true, isPublic: true },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_NOT_FOUND');
    }

    if (!creator.isPublic) {
      throw new AppError('This creator profile is private', 403, 'PROFILE_PRIVATE');
    }

    const whereClause: Prisma.PostWhereInput = {
      authorId: creator.userId,
      status: PostStatus.PUBLISHED,
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              followers: requesterUserId
                ? {
                    where: { followerId: requesterUserId },
                    select: { id: true },
                  }
                : false,
            },
          },
          category: true,
          skills: true,
          media: {
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              saves: true,
            },
          },
          likes: requesterUserId
            ? {
                where: { userId: requesterUserId },
                select: { id: true },
              }
            : false,
          saves: requesterUserId
            ? {
                where: { userId: requesterUserId },
                select: { id: true },
              }
            : false,
        },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map((p) => this.formatPostWithInteractions(p, requesterUserId)),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + posts.length < totalCount,
      },
    };
  }

  /**
   * Retrieves public chronological showcase feed (strictly PUBLISHED posts only).
   */
  public static async getShowcaseFeed(query: FeedQueryInput, currentUserId?: string) {
    const whereClause: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
    };

    if (query.categoryId) {
      whereClause.categoryId = query.categoryId;
    }

    if (query.postType) {
      whereClause.postType = query.postType;
    }

    if (query.skillId) {
      whereClause.skills = {
        some: { id: query.skillId },
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              followers: currentUserId
                ? {
                    where: { followerId: currentUserId },
                    select: { id: true },
                  }
                : false,
            },
          },
          creatorProfile: {
            select: {
              id: true,
              stageName: true,
              headline: true,
              location: true,
              primaryCategory: true,
              isVerified: true,
            },
          },
          category: true,
          skills: true,
          media: {
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              saves: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
          saves: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    return {
      posts: posts.map((p) => this.formatPostWithInteractions(p, currentUserId)),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + posts.length < totalCount,
      },
    };
  }
}
