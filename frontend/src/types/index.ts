export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL' | 'VETERAN';

export type AvailabilityStatus =
  | 'AVAILABLE_FOR_COLLAB'
  | 'OPEN_TO_WORK'
  | 'FREELANCE'
  | 'COMMISSION'
  | 'NOT_AVAILABLE';

export type PostType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT' | 'SHOWCASE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isOnboarded: boolean;
}

export interface CreatorSkill {
  id: string;
  name: string;
  slug: string;
  isPrimary: boolean;
  yearsExperience?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  themeKey?: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  stageName?: string;
  headline?: string;
  bio?: string;
  location: string;
  city?: string;
  country: string;
  experienceLevel: ExperienceLevel;
  yearsExperience?: number;
  availability: AvailabilityStatus;
  primaryCategory: Category;
  coverImageUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  roleAttributes?: Record<string, unknown>;
  collaborationPreferences?: {
    lookingFor?: string[];
  };
  skills: CreatorSkill[];
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    stageName?: string;
    avatarUrl?: string;
    role: UserRole;
  };
  title?: string;
  caption: string;
  postType: PostType;
  category?: Category;
  tags: string[];
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}
