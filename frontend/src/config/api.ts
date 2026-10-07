/**
 * Canonical API Base Configuration for ArtVest Frontend
 *
 * Architectural Requirements:
 * 1. The frontend must have ONE canonical API base URL.
 *    - Development: http://localhost:5000/api
 *    - Production:  https://artvest.onrender.com/api
 * 2. All endpoints are constructed consistently:
 *    - `${API_BASE_URL}/health`
 *    - `${API_BASE_URL}/auth/me`
 *    - `${API_BASE_URL}/auth/google`
 *    - `${API_BASE_URL}/auth/logout`
 * 3. Robust URL normalization prevents:
 *    - Missing '/api' prefix (e.g. 'https://artvest.onrender.com' -> 'https://artvest.onrender.com/api')
 *    - Double slashes from trailing slashes (e.g. 'https://artvest.onrender.com/api/' -> 'https://artvest.onrender.com/api')
 *    - Accidental duplication (e.g. '/api/api')
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const rawUrl = envUrl ? envUrl : 'http://localhost:5000/api';
  const trimmed = rawUrl.replace(/\/+$/, '');

  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  return `${trimmed}/api`;
}

export const API_BASE_URL = getApiBaseUrl();
