import { ApiResponse } from '../types';
import { API_BASE_URL } from '@/config/api';

export { API_BASE_URL };

export class ApiClient {
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

  public static async checkHealth() {
    return this.request<{
      status: string;
      uptime: number;
      version: string;
      services: { database: string };
    }>('/health');
  }
}
