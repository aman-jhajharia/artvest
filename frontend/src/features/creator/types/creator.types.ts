import { Category, ExperienceLevel, AvailabilityStatus, UserRole } from '@/types';

export interface CreatorSkillRelation {
  id: string;
  creatorProfileId: string;
  skillId: string;
  isPrimary: boolean;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number | null;
  createdAt: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    category?: Category;
  };
}

export interface CompletionChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  tip: string;
}

export interface ProfileCompletionBreakdown {
  score: number;
  checklist: CompletionChecklistItem[];
  missingItems: string[];
  rank: 'Emerging Talent' | 'Active Creative' | 'Established Creator' | 'Master Portfolio';
}

export interface PortfolioMedia {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  url: string;
  thumbnailUrl?: string | null;
  aspectRatio?: string | null;
  duration?: number | null;
}

export interface PortfolioItem {
  id: string;
  title?: string | null;
  caption: string;
  postType: string;
  isFeatured: boolean;
  createdAt: string;
  media: PortfolioMedia[];
  category?: Category | null;
}

export interface FullCreatorProfile {
  id: string;
  userId: string;
  stageName?: string | null;
  headline?: string | null;
  bio?: string | null;
  location: string;
  city?: string | null;
  country: string;
  experienceLevel: ExperienceLevel;
  yearsExperience?: number | null;
  availability: AvailabilityStatus;
  primaryCategoryId: string;
  primaryCategory: Category;
  coverImageUrl?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  roleAttributes?: Record<string, unknown> | null;
  collaborationPreferences?: {
    lookingFor?: string[];
    openForRemote?: boolean;
  } | null;
  profileCompletionScore: number;
  isVerified: boolean;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  creatorSkills: CreatorSkillRelation[];
  portfolio?: PortfolioItem[];
  user: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    role: UserRole;
    isOnboarded?: boolean;
  };
  completionBreakdown?: ProfileCompletionBreakdown;
}

export interface UpdateCreatorProfilePayload {
  stageName?: string | null;
  headline?: string;
  bio?: string;
  location?: string;
  city?: string | null;
  country?: string;
  experienceLevel?: ExperienceLevel;
  yearsExperience?: number;
  availability?: AvailabilityStatus;
  primaryCategoryId?: string;
  coverImageUrl?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  roleAttributes?: Record<string, unknown> | null;
  collaborationPreferences?: {
    lookingFor?: string[];
    openForRemote?: boolean;
  } | null;
  isPublic?: boolean;
}

export interface AddCreatorSkillPayload {
  skillId: string;
  isPrimary?: boolean;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number;
}

export interface UpdateCreatorSkillPayload {
  isPrimary?: boolean;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number;
}

export interface StandardUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  isOnboarded: boolean;
  profile?: {
    id: string;
    username: string;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    interests: string[];
  } | null;
}

export interface UpdateUserProfilePayload {
  name?: string;
  username?: string;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  interests?: string[];
}
