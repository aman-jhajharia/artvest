import { ApiResponse } from '@/types';
import {
  CreatorDiscoveryItem,
  ShowcaseDiscoveryItem,
  PaginationMetadata,
  ExploreQueryParams,
  CategoryOption,
  SkillOption,
} from '../types/explore.types';
import { API_BASE_URL } from '@/config/api';

export class ExploreApiService {
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

  /**
   * Search & filter creators with deterministic ranking.
   */
  public static async exploreCreators(
    params: ExploreQueryParams
  ): Promise<ApiResponse<CreatorDiscoveryItem[]> & { pagination?: PaginationMetadata }> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.category) searchParams.set('category', params.category);
    if (params.skill) searchParams.set('skill', params.skill);
    if (params.location) searchParams.set('location', params.location);
    if (params.experience) searchParams.set('experience', params.experience);
    if (params.availability) searchParams.set('availability', params.availability);
    if (params.proficiency) searchParams.set('proficiency', params.proficiency);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/explore/creators${qs ? `?${qs}` : ''}`;

    return this.request<CreatorDiscoveryItem[]>(endpoint);
  }

  /**
   * Search & filter published showcases.
   */
  public static async explorePosts(
    params: ExploreQueryParams
  ): Promise<ApiResponse<ShowcaseDiscoveryItem[]> & { pagination?: PaginationMetadata }> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.category) searchParams.set('category', params.category);
    if (params.skill) searchParams.set('skill', params.skill);
    if (params.postType) searchParams.set('postType', params.postType);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/explore/posts${qs ? `?${qs}` : ''}`;

    return this.request<ShowcaseDiscoveryItem[]>(endpoint);
  }

  /**
   * High-level explore overview.
   */
  public static async getOverview(params?: {
    q?: string;
    category?: string;
    limit?: number;
  }): Promise<
    ApiResponse<{
      featuredCreators: CreatorDiscoveryItem[];
      showcases: ShowcaseDiscoveryItem[];
      categories: Array<CategoryOption & { skillCount: number; creatorCount: number; postCount: number }>;
    }>
  > {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const endpoint = `/explore${qs ? `?${qs}` : ''}`;

    return this.request(endpoint);
  }

  /**
   * Fetches taxonomy categories dynamically.
   */
  public static async getCategories(): Promise<ApiResponse<CategoryOption[]>> {
    return this.request<CategoryOption[]>('/categories');
  }

  /**
   * Fetches taxonomy skills dynamically.
   */
  public static async getSkills(categoryId?: string): Promise<ApiResponse<SkillOption[]>> {
    const endpoint = categoryId ? `/skills?categoryId=${categoryId}` : '/skills';
    return this.request<SkillOption[]>(endpoint);
  }
}
