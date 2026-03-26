import { getToken } from '@/lib/token';
import { ApiResponse } from '@/types';

const API_BASE_URL = '/api';

interface FetchOptions extends RequestInit {
  needsAuth?: boolean;
}

/**
 * Helper function for making API requests with token handling
 */
async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { needsAuth = true, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (needsAuth) {
    const token = getToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Request failed' };
    }

    const data = await response.json();
    return { data: data as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message };
  }
}

export default apiCall;
