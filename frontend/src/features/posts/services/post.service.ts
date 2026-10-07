import { ApiResponse } from '@/types';
import {
  PostItem,
  CreatePostPayload,
  UpdatePostPayload,
  FeedQueryParams,
  CreatorPostsQueryParams,
  UploadedMediaResult,
} from '../types/post.types';
import { API_BASE_URL } from '@/config/api';

export class PostApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
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

  // Showcase Feed
  public static async getFeed(
    params?: FeedQueryParams
  ): Promise<ApiResponse<PostItem[]> & { pagination?: { page: number; limit: number; totalCount: number; totalPages: number; hasMore: boolean } }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.postType) searchParams.set('postType', params.postType);
    if (params?.skillId) searchParams.set('skillId', params.skillId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PostItem[]>(`/feed${query}`, { method: 'GET' }) as any;
  }

  // Create post / draft
  public static async createPost(payload: CreatePostPayload): Promise<ApiResponse<PostItem>> {
    return this.request<PostItem>('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get single post
  public static async getPost(postId: string): Promise<ApiResponse<PostItem>> {
    return this.request<PostItem>(`/posts/${postId}`, { method: 'GET' });
  }

  // Update post
  public static async updatePost(postId: string, payload: UpdatePostPayload): Promise<ApiResponse<PostItem>> {
    return this.request<PostItem>(`/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Delete post
  public static async deletePost(postId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Publish draft
  public static async publishPost(postId: string): Promise<ApiResponse<PostItem>> {
    return this.request<PostItem>(`/posts/${postId}/publish`, {
      method: 'POST',
    });
  }

  // Feature / Unfeature in portfolio
  public static async setFeatured(postId: string, isFeatured: boolean): Promise<ApiResponse<PostItem>> {
    return this.request<PostItem>(`/posts/${postId}/feature`, {
      method: isFeatured ? 'POST' : 'DELETE',
      body: JSON.stringify({ isFeatured }),
    });
  }

  // Creator studio own posts
  public static async getCreatorPosts(
    params?: CreatorPostsQueryParams
  ): Promise<ApiResponse<PostItem[]> & { pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PostItem[]>(`/creator/posts${query}`, { method: 'GET' }) as any;
  }

  // Public creator profile posts
  public static async getPublicCreatorPosts(
    creatorId: string,
    params?: CreatorPostsQueryParams
  ): Promise<ApiResponse<PostItem[]> & { pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params?.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PostItem[]>(`/creators/${creatorId}/posts${query}`, { method: 'GET' }) as any;
  }

  // Media upload through ArtVest backend abstraction
  public static async uploadMedia(file: File, mediaType?: string): Promise<ApiResponse<UploadedMediaResult>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (mediaType) {
        formData.append('mediaType', mediaType);
      }

      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      return data as ApiResponse<UploadedMediaResult>;
    } catch (error) {
      console.error('Media upload request failed:', error);
      return {
        success: false,
        message: 'Failed to upload media file',
        error: {
          code: 'UPLOAD_FAILED',
          details: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
