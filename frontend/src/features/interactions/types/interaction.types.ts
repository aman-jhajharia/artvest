export type InquiryStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface LikeResponse {
  liked: boolean;
  count: number;
}

export interface SaveResponse {
  saved: boolean;
  count: number;
}

export interface FollowResponse {
  following: boolean;
  followersCount: number;
}

export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: string;
  creatorProfile?: {
    id: string;
    stageName?: string | null;
    headline?: string | null;
    isVerified?: boolean;
  } | null;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  replies?: CommentItem[];
}

export interface CollaborationInquiryItem {
  id: string;
  senderId: string;
  recipientId: string;
  postId?: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
    creatorProfile?: {
      id: string;
      stageName?: string | null;
      headline?: string | null;
      isVerified?: boolean;
    } | null;
  };
  recipient?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
    creatorProfile?: {
      id: string;
      stageName?: string | null;
      headline?: string | null;
      isVerified?: boolean;
    } | null;
  };
  post?: {
    id: string;
    title?: string | null;
    caption: string;
    postType: string;
    media?: Array<{
      url: string;
      thumbnailUrl?: string | null;
    }>;
  } | null;
}
