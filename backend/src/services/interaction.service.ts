import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import { PostStatus, InquiryStatus, NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import {
  CreateCommentInput,
  UpdateCommentInput,
  CommentsQueryInput,
  SavedPostsQueryInput,
  FollowQueryInput,
  CreateInquiryInput,
  InquiriesQueryInput,
} from '../validators/interaction.validator.js';

export class InteractionService {
  // ==========================================
  // 1. POST LIKES
  // ==========================================

  public static async likePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true, authorId: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new AppError('Cannot like an unpublished or draft post', 400, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
    }

    // Idempotent like creation
    await prisma.like.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      create: {
        postId,
        userId,
      },
      update: {},
    });

    // Notify author if not self-like
    if (post.authorId !== userId) {
      await NotificationService.createNotification({
        recipientId: post.authorId,
        actorId: userId,
        type: NotificationType.POST_LIKED,
        title: 'New Like',
        message: 'liked your showcase post',
        resourceId: post.id,
        resourceType: 'POST',
      }).catch((err) => console.error('Failed to create like notification', err));
    }

    const count = await prisma.like.count({ where: { postId } });
    return { liked: true, count };
  }

  public static async unlikePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    await prisma.like.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    const count = await prisma.like.count({ where: { postId } });
    return { liked: false, count };
  }

  public static async getPostLikes(postId: string, currentUserId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    const [count, userLike] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      currentUserId
        ? prisma.like.findUnique({
            where: {
              postId_userId: {
                postId,
                userId: currentUserId,
              },
            },
          })
        : null,
    ]);

    return {
      count,
      liked: Boolean(userLike),
    };
  }

  // ==========================================
  // 2. SAVED POSTS (BOOKMARKS)
  // ==========================================

  public static async savePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new AppError('Cannot save an unpublished or draft post', 400, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
    }

    await prisma.save.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      create: {
        postId,
        userId,
      },
      update: {},
    });

    const count = await prisma.save.count({ where: { postId } });
    return { saved: true, count };
  }

  public static async unsavePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    await prisma.save.deleteMany({
      where: {
        postId,
        userId,
      },
    });

    const count = await prisma.save.count({ where: { postId } });
    return { saved: false, count };
  }

  public static async getUserSavedPosts(userId: string, query: SavedPostsQueryInput) {
    const skip = (query.page - 1) * query.limit;

    const [savedRecords, totalCount] = await Promise.all([
      prisma.save.findMany({
        where: {
          userId,
          post: {
            status: PostStatus.PUBLISHED,
          },
        },
        include: {
          post: {
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.save.count({
        where: {
          userId,
          post: {
            status: PostStatus.PUBLISHED,
          },
        },
      }),
    ]);

    const posts = savedRecords.map((r) => ({
      ...r.post,
      savedAt: r.createdAt,
      likeCount: r.post._count.likes,
      commentCount: r.post._count.comments,
      saveCount: r.post._count.saves,
      savedByMe: true,
    }));

    return {
      posts,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + posts.length < totalCount,
      },
    };
  }

  // ==========================================
  // 3. COMMENTS & NESTED REPLIES
  // ==========================================

  public static async createComment(userId: string, postId: string, input: CreateCommentInput) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true, authorId: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new AppError('Cannot comment on an unpublished or draft post', 400, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
    }

    let parentCommentId: string | null = null;
    if (input.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: input.parentId },
      });

      if (!parentComment) {
        throw new AppError('Parent comment not found', 404, 'PARENT_COMMENT_NOT_FOUND');
      }

      if (parentComment.postId !== postId) {
        throw new AppError('Parent comment belongs to a different post', 400, 'INVALID_PARENT_COMMENT');
      }

      // Keep replies flat or 1-level deep: if parent is already a reply, link to the top-level parent
      parentCommentId = parentComment.parentId || parentComment.id;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: input.content,
        parentId: parentCommentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            creatorProfile: {
              select: {
                id: true,
                stageName: true,
                headline: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    // Notify post author if not self-comment
    if (post.authorId !== userId) {
      await NotificationService.createNotification({
        recipientId: post.authorId,
        actorId: userId,
        type: NotificationType.COMMENT_CREATED,
        title: 'New Comment',
        message: 'commented on your showcase post',
        resourceId: post.id,
        resourceType: 'POST',
      }).catch((err) => console.error('Failed to create comment notification', err));
    }

    return comment;
  }

  public static async getPostComments(postId: string, query: CommentsQueryInput) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    const skip = (query.page - 1) * query.limit;

    // Fetch top-level comments with nested replies
    const [comments, totalTopLevel] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              creatorProfile: {
                select: {
                  id: true,
                  stageName: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  role: true,
                  creatorProfile: {
                    select: {
                      id: true,
                      stageName: true,
                      headline: true,
                      isVerified: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.comment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ]);

    const totalComments = await prisma.comment.count({ where: { postId } });

    return {
      comments,
      totalComments,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount: totalTopLevel,
        totalPages: Math.ceil(totalTopLevel / query.limit),
        hasMore: skip + comments.length < totalTopLevel,
      },
    };
  }

  public static async updateComment(userId: string, commentId: string, input: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    if (comment.authorId !== userId) {
      throw new AppError('You do not have permission to edit this comment', 403, 'FORBIDDEN_COMMENT_MUTATION');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: input.content,
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
      },
    });

    return updated;
  }

  public static async deleteComment(userId: string, commentId: string, userRole?: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('You do not have permission to delete this comment', 403, 'FORBIDDEN_COMMENT_MUTATION');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }

  // ==========================================
  // 4. CREATOR FOLLOW GRAPH
  // ==========================================

  private static async resolveTargetUserId(targetIdentifier: string): Promise<string> {
    // 1. Check if identifier is directly a User ID
    const user = await prisma.user.findUnique({
      where: { id: targetIdentifier },
      select: { id: true },
    });

    if (user) return user.id;

    // 2. Check if identifier is a CreatorProfile ID
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: targetIdentifier },
      select: { userId: true },
    });

    if (creator) return creator.userId;

    throw new AppError('Creator or user not found', 404, 'CREATOR_NOT_FOUND');
  }

  public static async followCreator(followerId: string, targetIdentifier: string) {
    const targetUserId = await this.resolveTargetUserId(targetIdentifier);

    if (followerId === targetUserId) {
      throw new AppError('You cannot follow yourself', 400, 'CANNOT_FOLLOW_SELF');
    }

    // Upsert follow record
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
      create: {
        followerId,
        followingId: targetUserId,
      },
      update: {},
    });

    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    // Notify followed creator
    if (followerId !== targetUserId) {
      await NotificationService.createNotification({
        recipientId: targetUserId,
        actorId: followerId,
        type: NotificationType.CREATOR_FOLLOWED,
        title: 'New Follower',
        message: 'started following your creative journey',
        resourceId: followerId,
        resourceType: 'USER',
      }).catch((err) => console.error('Failed to create follow notification', err));
    }

    return {
      following: true,
      followersCount,
    };
  }

  public static async unfollowCreator(followerId: string, targetIdentifier: string) {
    const targetUserId = await this.resolveTargetUserId(targetIdentifier);

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: targetUserId,
      },
    });

    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    return {
      following: false,
      followersCount,
    };
  }

  public static async getUserFollowers(targetIdentifier: string, query: FollowQueryInput) {
    const targetUserId = await this.resolveTargetUserId(targetIdentifier);
    const skip = (query.page - 1) * query.limit;

    const [follows, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: targetUserId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              creatorProfile: {
                select: {
                  id: true,
                  stageName: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.follow.count({ where: { followingId: targetUserId } }),
    ]);

    const followers = follows.map((f) => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));

    return {
      followers,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + followers.length < totalCount,
      },
    };
  }

  public static async getUserFollowing(targetIdentifier: string, query: FollowQueryInput) {
    const targetUserId = await this.resolveTargetUserId(targetIdentifier);
    const skip = (query.page - 1) * query.limit;

    const [follows, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: targetUserId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              creatorProfile: {
                select: {
                  id: true,
                  stageName: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
    ]);

    const following = follows.map((f) => ({
      ...f.following,
      followedAt: f.createdAt,
    }));

    return {
      following,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + following.length < totalCount,
      },
    };
  }

  // ==========================================
  // 5. COLLABORATION INQUIRIES
  // ==========================================

  public static async createInquiry(senderId: string, input: CreateInquiryInput) {
    const recipientUserId = await this.resolveTargetUserId(input.recipientId).catch(() => {
      throw new AppError('Recipient creator not found', 404, 'RECIPIENT_NOT_FOUND');
    });

    if (senderId === recipientUserId) {
      throw new AppError('You cannot send a collaboration inquiry to yourself', 400, 'CANNOT_INQUIRE_SELF');
    }

    if (input.postId) {
      const post = await prisma.post.findUnique({
        where: { id: input.postId },
        select: { id: true, status: true },
      });

      if (!post) {
        throw new AppError('Referenced post not found', 404, 'POST_NOT_FOUND');
      }

      if (post.status !== PostStatus.PUBLISHED) {
        throw new AppError('Cannot reference an unpublished or draft post', 400, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
      }
    }

    const inquiry = await prisma.collaborationInquiry.create({
      data: {
        senderId,
        recipientId: recipientUserId,
        postId: input.postId || null,
        message: input.message,
        status: InquiryStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            creatorProfile: {
              select: {
                id: true,
                stageName: true,
                headline: true,
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            creatorProfile: {
              select: {
                id: true,
                stageName: true,
                headline: true,
              },
            },
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            caption: true,
            postType: true,
            media: {
              take: 1,
              select: {
                url: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });

    // Notify recipient creator
    if (senderId !== recipientUserId) {
      await NotificationService.createNotification({
        recipientId: recipientUserId,
        actorId: senderId,
        type: NotificationType.COLLABORATION_INQUIRY_CREATED,
        title: 'New Collaboration Inquiry',
        message: 'sent you a collaboration inquiry',
        resourceId: inquiry.id,
        resourceType: 'INQUIRY',
      }).catch((err) => console.error('Failed to create inquiry notification', err));
    }

    return inquiry;
  }

  public static async getSentInquiries(senderId: string, query: InquiriesQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const whereClause: any = { senderId };
    if (query.status) {
      whereClause.status = query.status;
    }

    const [inquiries, totalCount] = await Promise.all([
      prisma.collaborationInquiry.findMany({
        where: whereClause,
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              creatorProfile: {
                select: {
                  id: true,
                  stageName: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              caption: true,
              postType: true,
              media: {
                take: 1,
                select: {
                  url: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.collaborationInquiry.count({ where: whereClause }),
    ]);

    return {
      inquiries,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + inquiries.length < totalCount,
      },
    };
  }

  public static async getReceivedInquiries(recipientId: string, query: InquiriesQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const whereClause: any = { recipientId };
    if (query.status) {
      whereClause.status = query.status;
    }

    const [inquiries, totalCount] = await Promise.all([
      prisma.collaborationInquiry.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              creatorProfile: {
                select: {
                  id: true,
                  stageName: true,
                  headline: true,
                  isVerified: true,
                },
              },
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              caption: true,
              postType: true,
              media: {
                take: 1,
                select: {
                  url: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.collaborationInquiry.count({ where: whereClause }),
    ]);

    return {
      inquiries,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit),
        hasMore: skip + inquiries.length < totalCount,
      },
    };
  }

  public static async updateInquiryStatus(userId: string, inquiryId: string, newStatus: InquiryStatus) {
    const inquiry = await prisma.collaborationInquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new AppError('Collaboration inquiry not found', 404, 'INQUIRY_NOT_FOUND');
    }

    if (inquiry.status !== InquiryStatus.PENDING) {
      throw new AppError(
        `Cannot change status of an inquiry that is already ${inquiry.status.toLowerCase()}`,
        400,
        'INVALID_INQUIRY_STATE'
      );
    }

    if (newStatus === InquiryStatus.WITHDRAWN) {
      // Only the sender can withdraw
      if (inquiry.senderId !== userId) {
        throw new AppError('Only the sender can withdraw their pending inquiry', 403, 'FORBIDDEN_INQUIRY_ACTION');
      }
    } else if (newStatus === InquiryStatus.ACCEPTED || newStatus === InquiryStatus.DECLINED) {
      // Only the recipient can accept or decline
      if (inquiry.recipientId !== userId) {
        throw new AppError(
          'Only the recipient creator can accept or decline this inquiry',
          403,
          'FORBIDDEN_INQUIRY_ACTION'
        );
      }
    } else {
      throw new AppError('Invalid inquiry status transition', 400, 'INVALID_INQUIRY_STATUS');
    }

    const updated = await prisma.collaborationInquiry.update({
      where: { id: inquiryId },
      data: { status: newStatus },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Notify inquiry sender of acceptance or decline
    if (newStatus === InquiryStatus.ACCEPTED) {
      await NotificationService.createNotification({
        recipientId: inquiry.senderId,
        actorId: userId,
        type: NotificationType.COLLABORATION_ACCEPTED,
        title: 'Inquiry Accepted',
        message: 'accepted your collaboration inquiry',
        resourceId: inquiry.id,
        resourceType: 'INQUIRY',
      }).catch((err) => console.error('Failed to create inquiry accept notification', err));
    } else if (newStatus === InquiryStatus.DECLINED) {
      await NotificationService.createNotification({
        recipientId: inquiry.senderId,
        actorId: userId,
        type: NotificationType.COLLABORATION_DECLINED,
        title: 'Inquiry Declined',
        message: 'declined your collaboration inquiry',
        resourceId: inquiry.id,
        resourceType: 'INQUIRY',
      }).catch((err) => console.error('Failed to create inquiry decline notification', err));
    }

    return updated;
  }
}
