import { ApiResponse, CreativeProjectItem } from '@/types';
import { API_BASE_URL } from '@/config/api';

export interface ProjectListResult {
  projects: CreativeProjectItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  fundingGoal: number;
  totalShares?: number;
  categoryId?: string | null;
  coverMediaUrl?: string | null;
  deadline?: string | null;
}

export interface InvestResult {
  investment: {
    id: string;
    projectId: string;
    investorId: string;
    creditsInvested: number;
    sharesAcquired: number;
    sharePercentage: number;
  };
  project: {
    id: string;
    amountRaised: number;
    sharesAllocated: number;
    status: string;
  };
  isNowFunded: boolean;
  investorBalance: number;
}

export class ProjectApiService {
  /**
   * List open or funded creative projects with optional filters.
   */
  public static async listProjects(params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ProjectListResult>> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetch(`${API_BASE_URL}/projects?${query.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch projects',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get project details and live shareholder cap table.
   */
  public static async getProjectById(id: string): Promise<ApiResponse<CreativeProjectItem>> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch project details',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Launch a new creative pitch (Creators only).
   */
  public static async createProject(payload: CreateProjectPayload): Promise<ApiResponse<CreativeProjectItem>> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create project',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Invest demo ArtCredits in multiples of 500 in exchange for fractional shares.
   */
  public static async investInProject(id: string, amount: number): Promise<ApiResponse<InvestResult>> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/invest`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to complete investment',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
