import { ApiResponse } from '@/types';
import {
  FullCreatorProfile,
  UpdateCreatorProfilePayload,
  CreatorSkillRelation,
  AddCreatorSkillPayload,
  UpdateCreatorSkillPayload,
  ProfileCompletionBreakdown,
  StandardUserProfile,
  UpdateUserProfilePayload,
} from '../types/creator.types';
import { API_BASE_URL } from '@/config/api';

export class CreatorApiService {
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

  // Creator profile endpoints
  public static async getCreatorProfile(): Promise<ApiResponse<FullCreatorProfile>> {
    return this.request<FullCreatorProfile>('/creator/profile', { method: 'GET' });
  }

  public static async updateCreatorProfile(
    payload: UpdateCreatorProfilePayload
  ): Promise<ApiResponse<FullCreatorProfile>> {
    return this.request<FullCreatorProfile>('/creator/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public static async getCreatorSkills(): Promise<ApiResponse<CreatorSkillRelation[]>> {
    return this.request<CreatorSkillRelation[]>('/creator/skills', { method: 'GET' });
  }

  public static async addCreatorSkill(
    payload: AddCreatorSkillPayload
  ): Promise<ApiResponse<CreatorSkillRelation>> {
    return this.request<CreatorSkillRelation>('/creator/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async updateCreatorSkill(
    skillId: string,
    payload: UpdateCreatorSkillPayload
  ): Promise<ApiResponse<CreatorSkillRelation>> {
    return this.request<CreatorSkillRelation>(`/creator/skills/${skillId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public static async deleteCreatorSkill(
    skillId: string
  ): Promise<ApiResponse<{ deletedSkillId: string; newCompletionScore: number }>> {
    return this.request<{ deletedSkillId: string; newCompletionScore: number }>(
      `/creator/skills/${skillId}`,
      { method: 'DELETE' }
    );
  }

  public static async getProfileCompletion(): Promise<ApiResponse<ProfileCompletionBreakdown>> {
    return this.request<ProfileCompletionBreakdown>('/creator/profile/completion', {
      method: 'GET',
    });
  }

  // Public creator profile discovery
  public static async getPublicCreatorProfile(
    creatorId: string
  ): Promise<ApiResponse<FullCreatorProfile>> {
    return this.request<FullCreatorProfile>(`/creators/${creatorId}`, { method: 'GET' });
  }

  // Standard user profile endpoints
  public static async getUserProfile(): Promise<ApiResponse<StandardUserProfile>> {
    return this.request<StandardUserProfile>('/user/profile', { method: 'GET' });
  }

  public static async updateUserProfile(
    payload: UpdateUserProfilePayload
  ): Promise<ApiResponse<StandardUserProfile>> {
    return this.request<StandardUserProfile>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Taxonomy endpoints
  public static async getCategories(): Promise<
    ApiResponse<Array<{ id: string; name: string; slug: string; themeKey?: string; description?: string }>>
  > {
    return this.request('/categories', { method: 'GET' });
  }

  public static async getSkills(
    categoryId?: string
  ): Promise<
    ApiResponse<Array<{ id: string; name: string; slug: string; categoryId: string; category?: unknown }>>
  > {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return this.request(`/skills${query}`, { method: 'GET' });
  }
}
