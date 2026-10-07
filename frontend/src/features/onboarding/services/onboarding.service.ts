import { ApiResponse, Category } from '@/types';
import { API_BASE_URL } from '@/config/api';

export interface SkillItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    themeKey?: string;
  };
}

export interface UserOnboardingPayload {
  name: string;
  username: string;
  bio?: string;
  location?: string;
  interests: string[];
}

export interface CreatorOnboardingPayload {
  stageName?: string;
  headline: string;
  bio: string;
  location: string;
  city?: string;
  country?: string;
  experienceLevel: string;
  yearsExperience: number;
  availability: string;
  primaryCategoryId: string;
  primarySkillId: string;
  additionalSkillIds: string[];
  roleAttributes: Record<string, unknown>;
  collaborationPreferences?: {
    lookingFor: string[];
    openForRemote: boolean;
  };
}

export class OnboardingService {
  public static async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch categories from database',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public static async getSkills(categoryId?: string): Promise<ApiResponse<SkillItem[]>> {
    try {
      const url = categoryId
        ? `${API_BASE_URL}/skills?categoryId=${encodeURIComponent(categoryId)}`
        : `${API_BASE_URL}/skills`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch skills from database',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public static async submitUserOnboarding(payload: UserOnboardingPayload): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/onboarding/user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit user onboarding',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public static async submitCreatorOnboarding(payload: CreatorOnboardingPayload): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/onboarding/creator`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit creator onboarding',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public static async getStatus(): Promise<ApiResponse<{ isOnboarded: boolean; role: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/onboarding/status`, {
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch onboarding status',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
