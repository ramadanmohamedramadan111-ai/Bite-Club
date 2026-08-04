import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;

  constructor(status: number, data: ApiErrorData) {
    super(data?.message ?? 'Something went wrong. Please try again.');
    this.name = 'ApiError';
    this.status = status;
    this.data = data ?? {};
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  isRetry?: boolean;
};

async function parseJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function refreshToken(): Promise<boolean> {
  const { token, setToken } = useAuthStore.getState();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await parseJson(res);
    if (res.ok && data?.data?.access_token) {
      setToken(data.data.access_token);
      return true;
    }
  } catch {
    // network failure — fall through to logout
  }
  useAuthStore.getState().logout();
  return false;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token } = useAuthStore.getState();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };
  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body !== undefined
          ? isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new ApiError(0, { message: 'Network error. Check your connection and try again.' });
  }

  if (res.status === 401 && token && !options.skipAuth && !options.isRetry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request<T>(path, { ...options, isRetry: true });
    }
  }

  const data = await parseJson(res);
  if (!res.ok) {
    throw new ApiError(res.status, data as ApiErrorData);
  }
  return data as T;
}

export const api = {
  get: <T = ApiEnvelope>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T = ApiEnvelope>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T = ApiEnvelope>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T = ApiEnvelope>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  del: <T = ApiEnvelope>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
