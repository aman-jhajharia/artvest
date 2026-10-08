import { getApiBaseUrl } from '../../../config/api';

/**
 * Derives the backend origin (e.g., https://artvest.onrender.com or http://localhost:5000)
 * from the configured canonical API base URL by stripping any trailing '/api' path.
 */
export function getBackendOrigin(): string {
  const apiUrl = getApiBaseUrl();
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch {
    return apiUrl.replace(/\/api\/?$/, '');
  }
}

/**
 * Resolves a media asset URL for browser rendering.
 *
 * Rules:
 * - Empty / falsy / non-string -> ''
 * - Absolute HTTP / HTTPS / Blob / Data URL -> unchanged (preserves Cloudinary and external URLs)
 * - Relative /uploads/... or uploads/... -> resolved against the backend origin
 * - Never produces duplicate /api paths
 *
 * Example:
 *   NEXT_PUBLIC_API_URL = "https://artvest.onrender.com/api"
 *   resolveMediaUrl("/uploads/test.jpg") -> "https://artvest.onrender.com/uploads/test.jpg"
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  // Already absolute or browser-generated data/blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const backendOrigin = getBackendOrigin().replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${backendOrigin}${path}`;
}
