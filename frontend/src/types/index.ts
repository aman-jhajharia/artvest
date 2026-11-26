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
  creditBalance?: number;
  heldBalance?: number;
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

export type ProjectStatus = 'OPEN' | 'FUNDED' | 'COMPLETED' | 'CANCELLED';

export type InvestmentStatus = 'HELD' | 'ALLOTTED' | 'RELEASED';

export type CreditTransactionType =
  | 'SIGNUP_BONUS'
  | 'DEMO_TOPUP'
  | 'PROJECT_INVESTMENT'
  | 'PROJECT_FUNDING_RECEIVED'
  | 'INVESTMENT_HOLD'
  | 'INVESTMENT_SETTLED'
  | 'INVESTMENT_RELEASED';

export interface ProjectCapTableEntry {
  investorId: string;
  name: string;
  avatarUrl?: string | null;
  creditsInvested: number;
  sharesAcquired: number;
  sharePercentage: number;
  status?: InvestmentStatus;
  createdAt: string;
}

export interface CreativeProjectItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  categoryId?: string | null;
  category?: Category | null;
  coverMediaUrl?: string | null;
  fundingGoal: number;
  amountRaised: number;
  totalShares: number;
  sharesAllocated: number;
  status: ProjectStatus;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    creatorProfile?: {
      stageName?: string | null;
      headline?: string | null;
      location?: string | null;
      isVerified?: boolean;
    } | null;
  } | null;
  backersCount: number;
  fundingProgressPercentage: number;
  remainingGap: number;
  sharePrice: number;
  capTable?: ProjectCapTableEntry[];
  currentUserInvestment?: {
    creditsInvested: number;
    sharesAcquired: number;
    sharePercentage: number;
    status?: InvestmentStatus;
  } | null;
}

export interface CreditTransactionItem {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: CreditTransactionType;
  referenceId?: string | null;
  description: string;
  createdAt: string;
}

export interface PortfolioItem {
  investmentId: string;
  projectId: string;
  projectTitle: string;
  projectStatus: ProjectStatus;
  status: InvestmentStatus;
  coverMediaUrl?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  creditsInvested: number;
  sharesAcquired: number;
  sharePercentage: number;
  fundingProgressPercentage: number;
  updatedAt: string;
}

export interface WalletData {
  creditBalance: number;
  heldBalance: number;
  totalBalance: number;
  totalInvestedCredits: number;
  activeHoldingsCount: number;
  portfolio: PortfolioItem[];
  transactions: CreditTransactionItem[];
}
