import { PostItem } from '@/features/posts/types/post.types';

export interface CreatorDiscoveryItem {
  id: string;
  userId: string;
  stageName: string;
  name: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  headline: string | null;
  bio: string | null;
  location: string;
  city: string | null;
  country: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL' | 'VETERAN';
  yearsExperience: number | null;
  availability: 'AVAILABLE_FOR_COLLAB' | 'OPEN_TO_WORK' | 'FREELANCE' | 'COMMISSION' | 'NOT_AVAILABLE';
  profileCompletionScore: number;
  isVerified: boolean;
  roleAttributes: Record<string, any> | null;
  primaryCategory: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    themeKey?: string | null;
  };
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    isPrimary: boolean;
    proficiency?: string | null;
    yearsExperience?: number | null;
  }>;
  followerCount: number;
  postCount: number;
  isFollowing: boolean;
  relevanceScore: number;
  scoreBreakdown: {
    keywordMatch: number;
    categoryMatch: number;
    skillMatch: number;
    locationMatch: number;
    experienceMatch: number;
    availabilityMatch: number;
    profileQuality: number;
    portfolioDepth: number;
  };
  createdAt: string;
}

export interface ShowcaseDiscoveryItem extends PostItem {
  relevanceScore?: number;
  scoreBreakdown?: {
    keywordMatch: number;
    categoryMatch: number;
    skillMatch: number;
    featuredBonus: number;
    engagementScore: number;
    recencyScore: number;
  };
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ExploreQueryParams {
  tab?: 'creators' | 'posts';
  q?: string;
  category?: string;
  skill?: string;
  location?: string;
  experience?: string;
  availability?: string;
  proficiency?: string;
  postType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  themeKey?: string | null;
  skills?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface SkillOption {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}
