import { ApiResponse } from '@/types';
import {
  StudioOverviewData,
  StudioPostPerformance,
} from '../types/studio.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GetStudioPostsApiResponse extends ApiResponse<StudioPostPerformance[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export class StudioApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
      return data as T;
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
      } as unknown as T;
    }
  }

  /**
   * Retrieves comprehensive Creator Studio overview analytics.
   */
  public static async getOverview(): Promise<ApiResponse<StudioOverviewData>> {
    return this.request<ApiResponse<StudioOverviewData>>('/studio/overview', {
      method: 'GET',
    });
  }

  /**
   * Retrieves creator posts performance metrics.
   */
  public static async getPostsPerformance(params?: {
    sort?: 'engagement' | 'likes' | 'comments' | 'saves' | 'views' | 'newest';
    page?: number;
    limit?: number;
  }): Promise<GetStudioPostsApiResponse> {
    const query = new URLSearchParams();
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<GetStudioPostsApiResponse>(`/studio/posts${qs}`, {
      method: 'GET',
    });
  }
}
