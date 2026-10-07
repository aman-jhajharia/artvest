import { Prisma, PostStatus, ExperienceLevel, AvailabilityStatus, PostType } from '@prisma/client';
import { prisma } from '../config/database.js';
import {
  CreatorExploreQuery,
  PostExploreQuery,
  ExploreOverviewQuery,
} from '../validators/explore.validator.js';

export interface CreatorScoreBreakdown {
  keywordMatch: number;
  categoryMatch: number;
  skillMatch: number;
  locationMatch: number;
  experienceMatch: number;
  availabilityMatch: number;
  profileQuality: number;
  portfolioDepth: number;
}

export interface PostScoreBreakdown {
  keywordMatch: number;
  categoryMatch: number;
  skillMatch: number;
  featuredBonus: number;
  engagementScore: number;
  recencyScore: number;
}

export class ExploreService {
  /**
   * Explores and filters public creators with deterministic relevance scoring.
   * Private creators (isPublic: false) are strictly excluded at the database layer.
   */
  public static async exploreCreators(query: CreatorExploreQuery, currentUserId?: string) {
    const rawSearch = (query.q || query.search || '').trim();
    const categoryFilter = (query.category || query.categoryId || '').trim();
    const skillFilter = (query.skill || query.skillId || '').trim();
    const locationFilter = (query.location || query.city || '').trim();
    const experienceFilter = query.experience || query.experienceLevel;
    const availabilityFilter = query.availability;
    const proficiencyFilter = (query.proficiency || '').trim();
    const sort = query.sort || 'relevance';
    const page = query.page || 1;
    const limit = query.limit || 12;

    // Base WHERE clause: strictly public creators
    const where: Prisma.CreatorProfileWhereInput = {
      isPublic: true,
    };

    // Category filter
    if (categoryFilter) {
      where.OR = [
        { primaryCategoryId: categoryFilter },
        { primaryCategory: { slug: categoryFilter.toLowerCase() } },
        { primaryCategory: { name: { equals: categoryFilter, mode: 'insensitive' } } },
      ];
    }

    // Skill filter
    if (skillFilter) {
      where.creatorSkills = {
        some: {
          skill: {
            OR: [
              { id: skillFilter },
              { slug: skillFilter.toLowerCase() },
              { name: { equals: skillFilter, mode: 'insensitive' } },
            ],
          },
        },
      };
    }

    // Location filter
    if (locationFilter) {
      const locConditions: Prisma.CreatorProfileWhereInput[] = [
        { location: { contains: locationFilter, mode: 'insensitive' } },
        { city: { contains: locationFilter, mode: 'insensitive' } },
        { country: { contains: locationFilter, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: locConditions }];
        delete where.OR;
      } else {
        where.OR = locConditions;
      }
    }

    // Experience filter
    if (experienceFilter) {
      where.experienceLevel = experienceFilter;
    }

    // Availability filter
    if (availabilityFilter) {
      where.availability = availabilityFilter;
    }

    // Proficiency filter if requested
    if (proficiencyFilter) {
      where.creatorSkills = {
        ...where.creatorSkills,
        some: {
          ...where.creatorSkills?.some,
          proficiency: { equals: proficiencyFilter, mode: 'insensitive' },
        },
      };
    }

    // Keyword search tokenization
    let searchTokens: string[] = [];
    if (rawSearch) {
      searchTokens = rawSearch
        .split(/[\s,+&]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && !['in', 'and', 'for', 'with', 'the', 'at', 'of', 'to'].includes(t.toLowerCase()));

      const keywordConditions: Prisma.CreatorProfileWhereInput[] = [
        { stageName: { contains: rawSearch, mode: 'insensitive' } },
        { headline: { contains: rawSearch, mode: 'insensitive' } },
        { bio: { contains: rawSearch, mode: 'insensitive' } },
        { location: { contains: rawSearch, mode: 'insensitive' } },
        { city: { contains: rawSearch, mode: 'insensitive' } },
        { user: { name: { contains: rawSearch, mode: 'insensitive' } } },
        { primaryCategory: { name: { contains: rawSearch, mode: 'insensitive' } } },
        { creatorSkills: { some: { skill: { name: { contains: rawSearch, mode: 'insensitive' } } } } },
      ];

      // Add individual tokens if multi-word
      if (searchTokens.length > 1) {
        for (const token of searchTokens) {
          keywordConditions.push(
            { stageName: { contains: token, mode: 'insensitive' } },
            { headline: { contains: token, mode: 'insensitive' } },
            { location: { contains: token, mode: 'insensitive' } },
            { city: { contains: token, mode: 'insensitive' } },
            { user: { name: { contains: token, mode: 'insensitive' } } },
            { primaryCategory: { name: { contains: token, mode: 'insensitive' } } },
            { creatorSkills: { some: { skill: { name: { contains: token, mode: 'insensitive' } } } } }
          );
        }
      }

      if (where.AND && Array.isArray(where.AND)) {
        where.AND.push({ OR: keywordConditions });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: keywordConditions }];
        delete where.OR;
      } else {
        where.OR = keywordConditions;
      }
    }

    // Retrieve matching candidates with relations and counts in a single query
    const candidates = await prisma.creatorProfile.findMany({
      where,
      include: {
        primaryCategory: true,
        creatorSkills: {
          include: {
            skill: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        user: {
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
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: {
              where: { status: PostStatus.PUBLISHED },
            },
          },
        },
      },
    });

    // Score and rank candidates deterministically
    const scoredCandidates = candidates.map((creator) => {
      const breakdown = this.calculateCreatorScore(creator, {
        rawSearch,
        searchTokens,
        categoryFilter,
        skillFilter,
        locationFilter,
        experienceFilter,
        availabilityFilter,
      });

      const relevanceScore =
        breakdown.keywordMatch +
        breakdown.categoryMatch +
        breakdown.skillMatch +
        breakdown.locationMatch +
        breakdown.experienceMatch +
        breakdown.availabilityMatch +
        breakdown.profileQuality +
        breakdown.portfolioDepth;

      return {
        creator,
        relevanceScore,
        scoreBreakdown: breakdown,
      };
    });

    // Sort deterministically based on requested sort dimension
    scoredCandidates.sort((a, b) => {
      if (sort === 'newest') {
        const timeDiff = b.creator.createdAt.getTime() - a.creator.createdAt.getTime();
        return timeDiff !== 0 ? timeDiff : a.creator.id.localeCompare(b.creator.id);
      }

      if (sort === 'profile_strength') {
        const scoreDiff = b.creator.profileCompletionScore - a.creator.profileCompletionScore;
        if (scoreDiff !== 0) return scoreDiff;
        const timeDiff = b.creator.createdAt.getTime() - a.creator.createdAt.getTime();
        return timeDiff !== 0 ? timeDiff : a.creator.id.localeCompare(b.creator.id);
      }

      if (sort === 'popular') {
        const aFollowers = a.creator.user._count?.followers || 0;
        const bFollowers = b.creator.user._count?.followers || 0;
        const followerDiff = bFollowers - aFollowers;
        if (followerDiff !== 0) return followerDiff;
        const viewDiff = b.creator.viewCount - a.creator.viewCount;
        if (viewDiff !== 0) return viewDiff;
        return a.creator.id.localeCompare(b.creator.id);
      }

      // Default: 'relevance'
      const relDiff = b.relevanceScore - a.relevanceScore;
      if (relDiff !== 0) return relDiff;
      const compDiff = b.creator.profileCompletionScore - a.creator.profileCompletionScore;
      if (compDiff !== 0) return compDiff;
      const timeDiff = b.creator.createdAt.getTime() - a.creator.createdAt.getTime();
      return timeDiff !== 0 ? timeDiff : a.creator.id.localeCompare(b.creator.id);
    });

    const totalCount = scoredCandidates.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = scoredCandidates.slice(startIndex, startIndex + limit);

    // Format output cards
    const items = paginatedItems.map(({ creator, relevanceScore, scoreBreakdown }) => {
      const isFollowing = currentUserId
        ? Boolean(creator.user.followers && creator.user.followers.length > 0)
        : false;

      return {
        id: creator.id,
        userId: creator.userId,
        stageName: creator.stageName || creator.user.name,
        name: creator.user.name,
        avatarUrl: creator.user.avatarUrl,
        coverImageUrl: creator.coverImageUrl,
        headline: creator.headline,
        bio: creator.bio,
        location: creator.location,
        city: creator.city,
        country: creator.country,
        experienceLevel: creator.experienceLevel,
        yearsExperience: creator.yearsExperience,
        availability: creator.availability,
        profileCompletionScore: creator.profileCompletionScore,
        isVerified: creator.isVerified,
        roleAttributes: creator.roleAttributes,
        primaryCategory: {
          id: creator.primaryCategory.id,
          name: creator.primaryCategory.name,
          slug: creator.primaryCategory.slug,
          icon: creator.primaryCategory.icon,
          themeKey: creator.primaryCategory.themeKey,
        },
        skills: creator.creatorSkills.map((cs) => ({
          id: cs.skill.id,
          name: cs.skill.name,
          slug: cs.skill.slug,
          isPrimary: cs.isPrimary,
          proficiency: cs.proficiency,
          yearsExperience: cs.yearsExperience,
        })),
        followerCount: creator.user._count?.followers || 0,
        postCount: creator._count?.posts || 0,
        isFollowing,
        relevanceScore,
        scoreBreakdown,
        createdAt: creator.createdAt,
      };
    });

    return {
      creators: items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: startIndex + items.length < totalCount,
      },
    };
  }

  /**
   * Explores published showcase posts with deterministic relevance ranking.
   * Draft, archived, or deleted posts are strictly excluded.
   */
  public static async explorePosts(query: PostExploreQuery, currentUserId?: string) {
    const rawSearch = (query.q || query.search || '').trim();
    const categoryFilter = (query.category || query.categoryId || '').trim();
    const skillFilter = (query.skill || query.skillId || '').trim();
    const postTypeFilter = query.postType;
    const sort = query.sort || 'relevance';
    const page = query.page || 1;
    const limit = query.limit || 12;

    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED, // STRICT
    };

    if (categoryFilter) {
      where.OR = [
        { categoryId: categoryFilter },
        { category: { slug: categoryFilter.toLowerCase() } },
        { category: { name: { equals: categoryFilter, mode: 'insensitive' } } },
      ];
    }

    if (postTypeFilter) {
      where.postType = postTypeFilter;
    }

    if (skillFilter) {
      where.skills = {
        some: {
          OR: [
            { id: skillFilter },
            { slug: skillFilter.toLowerCase() },
            { name: { equals: skillFilter, mode: 'insensitive' } },
          ],
        },
      };
    }

    let searchTokens: string[] = [];
    if (rawSearch) {
      searchTokens = rawSearch
        .split(/[\s,+&]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && !['in', 'and', 'for', 'with', 'the', 'at', 'of', 'to'].includes(t.toLowerCase()));

      const keywordConditions: Prisma.PostWhereInput[] = [
        { title: { contains: rawSearch, mode: 'insensitive' } },
        { caption: { contains: rawSearch, mode: 'insensitive' } },
        { description: { contains: rawSearch, mode: 'insensitive' } },
        { tags: { has: rawSearch } },
        { author: { name: { contains: rawSearch, mode: 'insensitive' } } },
        { creatorProfile: { stageName: { contains: rawSearch, mode: 'insensitive' } } },
        { category: { name: { contains: rawSearch, mode: 'insensitive' } } },
        { skills: { some: { name: { contains: rawSearch, mode: 'insensitive' } } } },
      ];

      if (searchTokens.length > 1) {
        for (const token of searchTokens) {
          keywordConditions.push(
            { title: { contains: token, mode: 'insensitive' } },
            { caption: { contains: token, mode: 'insensitive' } },
            { description: { contains: token, mode: 'insensitive' } },
            { tags: { has: token } },
            { author: { name: { contains: token, mode: 'insensitive' } } },
            { creatorProfile: { stageName: { contains: token, mode: 'insensitive' } } },
            { category: { name: { contains: token, mode: 'insensitive' } } },
            { skills: { some: { name: { contains: token, mode: 'insensitive' } } } }
          );
        }
      }

      if (where.AND && Array.isArray(where.AND)) {
        where.AND.push({ OR: keywordConditions });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: keywordConditions }];
        delete where.OR;
      } else {
        where.OR = keywordConditions;
      }
    }

    const posts = await prisma.post.findMany({
      where,
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
            experienceLevel: true,
            isVerified: true,
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
    });

    const scoredPosts = posts.map((post) => {
      const breakdown = this.calculatePostScore(post, {
        rawSearch,
        searchTokens,
        categoryFilter,
        skillFilter,
      });

      const relevanceScore =
        breakdown.keywordMatch +
        breakdown.categoryMatch +
        breakdown.skillMatch +
        breakdown.featuredBonus +
        breakdown.engagementScore +
        breakdown.recencyScore;

      return {
        post,
        relevanceScore,
        scoreBreakdown: breakdown,
      };
    });

    scoredPosts.sort((a, b) => {
      if (sort === 'newest') {
        const timeA = a.post.publishedAt?.getTime() || a.post.createdAt.getTime();
        const timeB = b.post.publishedAt?.getTime() || b.post.createdAt.getTime();
        const diff = timeB - timeA;
        return diff !== 0 ? diff : a.post.id.localeCompare(b.post.id);
      }

      if (sort === 'popular') {
        const likesDiff = (b.post._count.likes || 0) - (a.post._count.likes || 0);
        if (likesDiff !== 0) return likesDiff;
        const savesDiff = (b.post._count.saves || 0) - (a.post._count.saves || 0);
        if (savesDiff !== 0) return savesDiff;
        return a.post.id.localeCompare(b.post.id);
      }

      // Default: 'relevance'
      const relDiff = b.relevanceScore - a.relevanceScore;
      if (relDiff !== 0) return relDiff;
      const timeA = a.post.publishedAt?.getTime() || a.post.createdAt.getTime();
      const timeB = b.post.publishedAt?.getTime() || b.post.createdAt.getTime();
      const diff = timeB - timeA;
      return diff !== 0 ? diff : a.post.id.localeCompare(b.post.id);
    });

    const totalCount = scoredPosts.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = scoredPosts.slice(startIndex, startIndex + limit);

    const items = paginatedItems.map(({ post, relevanceScore, scoreBreakdown }) => {
      const likedByMe = currentUserId ? Boolean(post.likes && post.likes.length > 0) : false;
      const savedByMe = currentUserId ? Boolean(post.saves && post.saves.length > 0) : false;
      const followingCreator = currentUserId
        ? Boolean(post.author.followers && post.author.followers.length > 0)
        : false;

      return {
        id: post.id,
        authorId: post.authorId,
        creatorProfileId: post.creatorProfileId,
        title: post.title,
        caption: post.caption,
        description: post.description,
        postType: post.postType,
        status: post.status,
        tags: post.tags,
        isFeatured: post.isFeatured,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        author: {
          id: post.author.id,
          name: post.author.name,
          avatarUrl: post.author.avatarUrl,
        },
        creatorProfile: post.creatorProfile,
        category: post.category,
        skills: post.skills,
        media: post.media,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        saveCount: post._count.saves,
        likedByMe,
        savedByMe,
        followingCreator,
        relevanceScore,
        scoreBreakdown,
      };
    });

    return {
      posts: items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: startIndex + items.length < totalCount,
      },
    };
  }

  /**
   * Retrieves high-level Explore overview containing featured creators, showcases, and active categories.
   */
  public static async getExploreOverview(query: ExploreOverviewQuery, currentUserId?: string) {
    const limit = query.limit || 6;
    const [creatorsResult, postsResult, categories] = await Promise.all([
      this.exploreCreators(
        {
          q: query.q,
          category: query.category,
          location: query.location,
          sort: 'relevance',
          page: 1,
          limit,
        },
        currentUserId
      ),
      this.explorePosts(
        {
          q: query.q,
          category: query.category,
          sort: 'relevance',
          page: 1,
          limit,
        },
        currentUserId
      ),
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              skills: true,
              creatorProfiles: { where: { isPublic: true } },
              posts: { where: { status: PostStatus.PUBLISHED } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      featuredCreators: creatorsResult.creators,
      showcases: postsResult.posts,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        themeKey: cat.themeKey,
        skillCount: cat._count.skills,
        creatorCount: cat._count.creatorProfiles,
        postCount: cat._count.posts,
      })),
    };
  }

  // ==========================================
  // DETERMINISTIC SCORING FORMULAS
  // ==========================================

  /**
   * Calculates explainable relevance score breakdown for a CreatorProfile.
   *
   * Formula:
   * Total = keywordMatch (max 40)
   *       + categoryMatch (20)
   *       + skillMatch (max 25)
   *       + locationMatch (15)
   *       + experienceMatch (10)
   *       + availabilityMatch (10)
   *       + profileQuality (max 15)
   *       + portfolioDepth (max 10)
   */
  private static calculateCreatorScore(
    creator: any,
    ctx: {
      rawSearch: string;
      searchTokens: string[];
      categoryFilter: string;
      skillFilter: string;
      locationFilter: string;
      experienceFilter?: ExperienceLevel;
      availabilityFilter?: AvailabilityStatus;
    }
  ): CreatorScoreBreakdown {
    let keywordMatch = 0;
    let categoryMatch = 0;
    let skillMatch = 0;
    let locationMatch = 0;
    let experienceMatch = 0;
    let availabilityMatch = 0;

    // 1. Keyword matching
    if (ctx.rawSearch) {
      const qLower = ctx.rawSearch.toLowerCase();
      const stageNameLower = (creator.stageName || '').toLowerCase();
      const userNameLower = (creator.user.name || '').toLowerCase();
      const headlineLower = (creator.headline || '').toLowerCase();
      const bioLower = (creator.bio || '').toLowerCase();
      const locLower = (creator.location || '').toLowerCase();
      const cityLower = (creator.city || '').toLowerCase();
      const catLower = (creator.primaryCategory.name || '').toLowerCase();

      // Exact or partial phrase match
      if (stageNameLower === qLower || userNameLower === qLower) {
        keywordMatch += 30;
      } else if (stageNameLower.includes(qLower) || userNameLower.includes(qLower)) {
        keywordMatch += 20;
      }

      if (headlineLower.includes(qLower)) keywordMatch += 15;
      if (locLower.includes(qLower) || cityLower.includes(qLower)) keywordMatch += 12;
      if (catLower.includes(qLower)) keywordMatch += 10;
      if (bioLower.includes(qLower)) keywordMatch += 6;

      // Token matching for multi-attribute queries (e.g. "Classical Singer in Jaipur")
      if (ctx.searchTokens.length > 0) {
        for (const token of ctx.searchTokens) {
          const tLower = token.toLowerCase();
          const inSkills = creator.creatorSkills.some((cs: any) =>
            cs.skill.name.toLowerCase().includes(tLower)
          );
          const inName = stageNameLower.includes(tLower) || userNameLower.includes(tLower);
          const inLoc = locLower.includes(tLower) || cityLower.includes(tLower);
          const inHead = headlineLower.includes(tLower);
          const inBio = bioLower.includes(tLower);
          const inCat = catLower.includes(tLower);

          if (inSkills) keywordMatch += 10;
          if (inName) keywordMatch += 10;
          if (inLoc) keywordMatch += 8;
          if (inHead) keywordMatch += 6;
          if (inCat) keywordMatch += 5;
          if (inBio) keywordMatch += 3;
        }
      }

      keywordMatch = Math.min(keywordMatch, 40);
    }

    // 2. Category matching
    if (ctx.categoryFilter) {
      const catF = ctx.categoryFilter.toLowerCase();
      if (
        creator.primaryCategoryId === ctx.categoryFilter ||
        creator.primaryCategory.slug.toLowerCase() === catF ||
        creator.primaryCategory.name.toLowerCase() === catF
      ) {
        categoryMatch = 20;
      }
    }

    // 3. Skill matching
    if (ctx.skillFilter) {
      const sF = ctx.skillFilter.toLowerCase();
      const matchingSkill = creator.creatorSkills.find(
        (cs: any) =>
          cs.skill.id === ctx.skillFilter ||
          cs.skill.slug.toLowerCase() === sF ||
          cs.skill.name.toLowerCase() === sF
      );
      if (matchingSkill) {
        skillMatch = matchingSkill.isPrimary ? 25 : 15;
      }
    }

    // 4. Location matching
    if (ctx.locationFilter) {
      const locF = ctx.locationFilter.toLowerCase();
      const loc = (creator.location || '').toLowerCase();
      const city = (creator.city || '').toLowerCase();
      if (loc.includes(locF) || city.includes(locF)) {
        locationMatch = 15;
      }
    }

    // 5. Experience matching
    if (ctx.experienceFilter) {
      if (creator.experienceLevel === ctx.experienceFilter) {
        experienceMatch = 10;
      }
    }

    // 6. Availability matching
    if (ctx.availabilityFilter) {
      if (creator.availability === ctx.availabilityFilter) {
        availabilityMatch = 10;
      }
    } else {
      // Small passive discovery boost for actively collaborative creators
      if (creator.availability === AvailabilityStatus.AVAILABLE_FOR_COLLAB) {
        availabilityMatch = 6;
      } else if (creator.availability === AvailabilityStatus.OPEN_TO_WORK) {
        availabilityMatch = 4;
      }
    }

    // 7. Profile Quality Score (up to 15 pts)
    const profileQuality = Math.min(
      Math.round((creator.profileCompletionScore || 0) * 0.1) + (creator.isVerified ? 5 : 0),
      15
    );

    // 8. Portfolio Depth Score (up to 10 pts)
    const portfolioDepth = Math.min((creator._count?.posts || 0) * 2, 10);

    return {
      keywordMatch,
      categoryMatch,
      skillMatch,
      locationMatch,
      experienceMatch,
      availabilityMatch,
      profileQuality,
      portfolioDepth,
    };
  }

  /**
   * Calculates explainable relevance score breakdown for a Post showcase.
   */
  private static calculatePostScore(
    post: any,
    ctx: {
      rawSearch: string;
      searchTokens: string[];
      categoryFilter: string;
      skillFilter: string;
    }
  ): PostScoreBreakdown {
    let keywordMatch = 0;
    let categoryMatch = 0;
    let skillMatch = 0;

    if (ctx.rawSearch) {
      const qLower = ctx.rawSearch.toLowerCase();
      const titleLower = (post.title || '').toLowerCase();
      const captionLower = (post.caption || '').toLowerCase();
      const descLower = (post.description || '').toLowerCase();
      const authorLower = (post.author.name || '').toLowerCase();

      if (titleLower.includes(qLower)) keywordMatch += 25;
      if (captionLower.includes(qLower) || descLower.includes(qLower)) keywordMatch += 15;
      if (authorLower.includes(qLower)) keywordMatch += 10;
      if (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(qLower))) {
        keywordMatch += 15;
      }

      keywordMatch = Math.min(keywordMatch, 40);
    }

    if (ctx.categoryFilter) {
      const catF = ctx.categoryFilter.toLowerCase();
      if (
        post.categoryId === ctx.categoryFilter ||
        post.category?.slug.toLowerCase() === catF ||
        post.category?.name.toLowerCase() === catF
      ) {
        categoryMatch = 20;
      }
    }

    if (ctx.skillFilter) {
      const sF = ctx.skillFilter.toLowerCase();
      if (
        post.skills &&
        post.skills.some(
          (s: any) =>
            s.id === ctx.skillFilter ||
            s.slug.toLowerCase() === sF ||
            s.name.toLowerCase() === sF
        )
      ) {
        skillMatch = 20;
      }
    }

    const featuredBonus = post.isFeatured ? 15 : 0;
    const engagementScore = Math.min(
      (post._count?.likes || 0) * 2 + (post._count?.saves || 0) * 3,
      25
    );

    // Recency bonus
    let recencyScore = 0;
    if (post.publishedAt) {
      const daysOld = (Date.now() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld <= 7) recencyScore = 10;
      else if (daysOld <= 30) recencyScore = 5;
    }

    return {
      keywordMatch,
      categoryMatch,
      skillMatch,
      featuredBonus,
      engagementScore,
      recencyScore,
    };
  }
}
