import { prisma } from '../config/database.js';
import { PostStatus } from '@prisma/client';
import { AppError } from '../utils/apiResponse.js';
import { StudioPostsQuery } from '../validators/studio.validator.js';

export class StudioService {
  /**
   * Retrieves comprehensive Creator Studio overview analytics.
   * Derives creator identity strictly from the authenticated userId.
   */
  public static async getStudioOverview(userId: string) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        primaryCategory: true,
        creatorSkills: {
          include: { skill: true },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!creator) {
      throw new AppError(
        'A Creator Profile is required to access Creator Studio analytics',
        403,
        'CREATOR_PROFILE_REQUIRED'
      );
    }

    // Execute aggregated queries in parallel
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
      totalLikes,
      totalComments,
      totalSaves,
      totalFollowers,
      totalInquiries,
      pendingInquiries,
      acceptedInquiries,
      declinedInquiries,
      publishedPostCandidates,
      recentFollowerRecords,
    ] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.count({ where: { authorId: userId, status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { authorId: userId, status: PostStatus.DRAFT } }),
      prisma.post.count({
        where: { authorId: userId, status: PostStatus.PUBLISHED, isFeatured: true },
      }),
      prisma.like.count({ where: { post: { authorId: userId } } }),
      prisma.comment.count({ where: { post: { authorId: userId } } }),
      prisma.save.count({ where: { post: { authorId: userId } } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.collaborationInquiry.count({ where: { recipientId: userId } }),
      prisma.collaborationInquiry.count({
        where: { recipientId: userId, status: 'PENDING' },
      }),
      prisma.collaborationInquiry.count({
        where: { recipientId: userId, status: 'ACCEPTED' },
      }),
      prisma.collaborationInquiry.count({
        where: { recipientId: userId, status: 'DECLINED' },
      }),
      prisma.post.findMany({
        where: { authorId: userId, status: PostStatus.PUBLISHED },
        include: {
          media: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              saves: true,
            },
          },
        },
        take: 20,
      }),
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalEngagement = totalLikes + totalComments + totalSaves;
    const resolvedInquiries = acceptedInquiries + declinedInquiries;
    const acceptanceRate =
      resolvedInquiries > 0 ? Math.round((acceptedInquiries / resolvedInquiries) * 100) : 0;

    // Rank top performing posts deterministically: engagementScore = likes + comments + saves
    const rankedTopPosts = publishedPostCandidates
      .map((p) => {
        const likesCount = p._count.likes;
        const commentsCount = p._count.comments;
        const savesCount = p._count.saves;
        const engagementScore = likesCount + commentsCount + savesCount;

        return {
          id: p.id,
          title: p.title || p.caption,
          caption: p.caption,
          postType: p.postType,
          isFeatured: p.isFeatured,
          publishedAt: p.publishedAt,
          viewCount: p.viewCount,
          mediaThumbnail: p.media[0]?.thumbnailUrl || p.media[0]?.url || null,
          likesCount,
          commentsCount,
          savesCount,
          engagementScore,
        };
      })
      .sort((a, b) => {
        const engDiff = b.engagementScore - a.engagementScore;
        if (engDiff !== 0) return engDiff;
        const timeA = a.publishedAt?.getTime() || 0;
        const timeB = b.publishedAt?.getTime() || 0;
        const timeDiff = timeB - timeA;
        return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
      })
      .slice(0, 5);

    const formattedRecentFollowers = recentFollowerRecords.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      avatarUrl: f.follower.avatarUrl,
      followedAt: f.createdAt,
    }));

    return {
      creator: {
        id: creator.id,
        stageName: creator.stageName,
        headline: creator.headline,
        profileCompletionScore: creator.profileCompletionScore,
        isPublic: creator.isPublic,
        isVerified: creator.isVerified,
        viewCount: creator.viewCount,
        primaryCategory: {
          id: creator.primaryCategory.id,
          name: creator.primaryCategory.name,
          slug: creator.primaryCategory.slug,
          themeKey: creator.primaryCategory.themeKey,
        },
        skills: creator.creatorSkills.map((cs) => ({
          id: cs.skill.id,
          name: cs.skill.name,
          isPrimary: cs.isPrimary,
          proficiency: cs.proficiency,
        })),
      },
      metrics: {
        totalPosts,
        publishedPosts,
        draftPosts,
        featuredPosts,
        totalLikes,
        totalComments,
        totalSaves,
        totalFollowers,
        totalEngagement,
        profileViews: creator.viewCount,
        profileCompletionScore: creator.profileCompletionScore,
      },
      collaboration: {
        totalInquiries,
        pendingInquiries,
        acceptedInquiries,
        declinedInquiries,
        acceptanceRate,
      },
      topPosts: rankedTopPosts,
      recentFollowers: formattedRecentFollowers,
    };
  }

  /**
   * Retrieves detailed post performance list for Creator Studio.
   */
  public static async getStudioPostsPerformance(userId: string, query: StudioPostsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sort = query.sort || 'engagement';
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        include: {
          media: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              saves: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { authorId: userId } }),
    ]);

    // Format and calculate engagement for each post
    const formatted = posts.map((p) => {
      const likesCount = p._count.likes;
      const commentsCount = p._count.comments;
      const savesCount = p._count.saves;
      const engagementScore = likesCount + commentsCount + savesCount;

      return {
        id: p.id,
        title: p.title || p.caption,
        caption: p.caption,
        postType: p.postType,
        status: p.status,
        isFeatured: p.isFeatured,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        viewCount: p.viewCount,
        mediaThumbnail: p.media[0]?.thumbnailUrl || p.media[0]?.url || null,
        likesCount,
        commentsCount,
        savesCount,
        engagementScore,
      };
    });

    // Sort deterministically
    formatted.sort((a, b) => {
      if (sort === 'likes') {
        const diff = b.likesCount - a.likesCount;
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      }
      if (sort === 'comments') {
        const diff = b.commentsCount - a.commentsCount;
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      }
      if (sort === 'saves') {
        const diff = b.savesCount - a.savesCount;
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      }
      if (sort === 'views') {
        const diff = b.viewCount - a.viewCount;
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      }
      if (sort === 'newest') {
        const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
        return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
      }

      // Default: 'engagement'
      const engDiff = b.engagementScore - a.engagementScore;
      if (engDiff !== 0) return engDiff;
      const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
      return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
    });

    const paginated = formatted.slice(skip, skip + limit);

    return {
      posts: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + paginated.length < total,
      },
    };
  }
}
