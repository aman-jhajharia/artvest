import { ApiResponse } from '@/types';
import { PostItem } from '@/features/posts/types/post.types';
import {
  LikeResponse,
  SaveResponse,
  FollowResponse,
  CommentItem,
  CollaborationInquiryItem,
  InquiryStatus,
} from '../types/interaction.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class InteractionApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      return {
        success: false,
        message: 'Network error or service unreachable',
        error: {
          code: 'NETWORK_ERROR',
          details: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==========================================
  // 1. POST LIKES
  // ==========================================

  public static async likePost(postId: string): Promise<ApiResponse<LikeResponse>> {
    return this.request<LikeResponse>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  public static async unlikePost(postId: string): Promise<ApiResponse<LikeResponse>> {
    return this.request<LikeResponse>(`/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  public static async getLikes(postId: string): Promise<ApiResponse<LikeResponse>> {
    return this.request<LikeResponse>(`/posts/${postId}/likes`, {
      method: 'GET',
    });
  }

  // ==========================================
  // 2. SAVED POSTS (BOOKMARKS)
  // ==========================================

  public static async savePost(postId: string): Promise<ApiResponse<SaveResponse>> {
    return this.request<SaveResponse>(`/posts/${postId}/save`, {
      method: 'POST',
    });
  }

  public static async unsavePost(postId: string): Promise<ApiResponse<SaveResponse>> {
    return this.request<SaveResponse>(`/posts/${postId}/save`, {
      method: 'DELETE',
    });
  }

  public static async getSavedPosts(
    page: number = 1,
    limit: number = 12
  ): Promise<
    ApiResponse<PostItem[]> & {
      pagination?: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasMore: boolean;
      };
    }
  > {
    return this.request<PostItem[]>(`/user/saved?page=${page}&limit=${limit}`, {
      method: 'GET',
    }) as any;
  }

  // ==========================================
  // 3. COMMENTS & REPLIES
  // ==========================================

  public static async getComments(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<
    ApiResponse<CommentItem[]> & {
      totalComments?: number;
      pagination?: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasMore: boolean;
      };
    }
  > {
    return this.request<CommentItem[]>(`/posts/${postId}/comments?page=${page}&limit=${limit}`, {
      method: 'GET',
    }) as any;
  }

  public static async createComment(
    postId: string,
    content: string,
    parentId?: string | null
  ): Promise<ApiResponse<CommentItem>> {
    return this.request<CommentItem>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parentId: parentId || undefined,
      }),
    });
  }

  public static async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<CommentItem>> {
    return this.request<CommentItem>(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  public static async deleteComment(commentId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // 4. CREATOR FOLLOW GRAPH
  // ==========================================

  public static async followCreator(creatorId: string): Promise<ApiResponse<FollowResponse>> {
    return this.request<FollowResponse>(`/creators/${creatorId}/follow`, {
      method: 'POST',
    });
  }

  public static async unfollowCreator(creatorId: string): Promise<ApiResponse<FollowResponse>> {
    return this.request<FollowResponse>(`/creators/${creatorId}/follow`, {
      method: 'DELETE',
    });
  }

  public static async getFollowers(
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    const query = userId ? `?userId=${userId}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return this.request<any[]>(`/user/followers${query}`, {
      method: 'GET',
    });
  }

  public static async getFollowing(
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    const query = userId ? `?userId=${userId}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return this.request<any[]>(`/user/following${query}`, {
      method: 'GET',
    });
  }

  // ==========================================
  // 5. COLLABORATION INQUIRIES
  // ==========================================

  public static async createInquiry(
    recipientId: string,
    message: string,
    postId?: string | null
  ): Promise<ApiResponse<CollaborationInquiryItem>> {
    return this.request<CollaborationInquiryItem>('/collaboration/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        recipientId,
        message,
        postId: postId || undefined,
      }),
    });
  }

  public static async getSentInquiries(
    page: number = 1,
    limit: number = 20,
    status?: InquiryStatus
  ): Promise<
    ApiResponse<CollaborationInquiryItem[]> & {
      pagination?: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasMore: boolean;
      };
    }
  > {
    const statusQuery = status ? `&status=${status}` : '';
    return this.request<CollaborationInquiryItem[]>(
      `/collaboration/inquiries/sent?page=${page}&limit=${limit}${statusQuery}`,
      {
        method: 'GET',
      }
    ) as any;
  }

  public static async getReceivedInquiries(
    page: number = 1,
    limit: number = 20,
    status?: InquiryStatus
  ): Promise<
    ApiResponse<CollaborationInquiryItem[]> & {
      pagination?: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasMore: boolean;
      };
    }
  > {
    const statusQuery = status ? `&status=${status}` : '';
    return this.request<CollaborationInquiryItem[]>(
      `/collaboration/inquiries/received?page=${page}&limit=${limit}${statusQuery}`,
      {
        method: 'GET',
      }
    ) as any;
  }

  public static async updateInquiryStatus(
    inquiryId: string,
    status: InquiryStatus
  ): Promise<ApiResponse<CollaborationInquiryItem>> {
    return this.request<CollaborationInquiryItem>(`/collaboration/inquiries/${inquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}
