import { ApiResponse } from '@edudeca/types';
import Constants from 'expo-constants';

// Central API Base URL with dynamic fallback to current Metro Host IP
const getDynamicApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:4000/api`;
    }
  }
  return 'http://192.168.0.103:4000/api';
};

const API_BASE_URL = getDynamicApiUrl();

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;
let currentUserId: string | null = null;

export const setAuthTokenGetter = (getter: TokenGetter) => {
  tokenGetter = getter;
};

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Inject Clerk JWT Token if available
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (_err) {
      // Ignore token getter errors in offline mode
    }
  }

  // Inject current active User ID fallback
  if (currentUserId && !headers['x-user-id']) {
    headers['x-user-id'] = currentUserId;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || `HTTP Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // eslint-disable-next-line no-console
    console.log(`[API Client Offline Fallback] ${url}:`, error.message);
    throw new ApiError(error.message || 'Network request failed', 0);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET', params }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
