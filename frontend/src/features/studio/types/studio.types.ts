export interface StudioCreator {
  id: string;
  stageName?: string;
  headline?: string;
  profileCompletionScore: number;
  isPublic: boolean;
  isVerified: boolean;
  viewCount: number;
  primaryCategory: {
    id: string;
    name: string;
    slug: string;
    themeKey?: string;
  };
  skills: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
    proficiency?: string;
  }>;
}

export interface StudioMetrics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalFollowers: number;
  totalEngagement: number;
  profileViews: number;
  profileCompletionScore: number;
}

export interface StudioCollaboration {
  totalInquiries: number;
  pendingInquiries: number;
  acceptedInquiries: number;
  declinedInquiries: number;
  acceptanceRate: number;
}

export interface StudioTopPost {
  id: string;
  title?: string;
  caption: string;
  postType: string;
  isFeatured: boolean;
  publishedAt?: string;
  viewCount: number;
  mediaThumbnail?: string | null;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  engagementScore: number;
}

export interface StudioRecentFollower {
  id: string;
  name: string;
  avatarUrl?: string | null;
  followedAt: string;
}

export interface StudioOverviewData {
  creator: StudioCreator;
  metrics: StudioMetrics;
  collaboration: StudioCollaboration;
  topPosts: StudioTopPost[];
  recentFollowers: StudioRecentFollower[];
}

export interface StudioPostPerformance {
  id: string;
  title?: string;
  caption: string;
  postType: string;
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  viewCount: number;
  mediaThumbnail?: string | null;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  engagementScore: number;
}
