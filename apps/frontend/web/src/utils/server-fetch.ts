import { getLocale, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

import { APIError } from '@/lib/errors/api-error';
import { NetworkError } from '@/lib/errors/network-error';

type FetchMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'QUERY'
  | 'HEAD'
  | 'OPTIONS';

interface FetchAPIOptions {
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  skipRefresh?: boolean;
}

const API_URL = process.env.API_BASE_URL!;

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const cookieStore = await cookies();
        const locale = await getLocale();

        const response = await fetch(`${API_URL}/user/refresh`, {
          method: 'POST',
          headers: {
            Cookie: cookieStore.toString(),
            'Accept-Language': locale,
            Accept: 'application/json',
          },
        });

        return response.ok;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function serverFetch<T>(
  endpoint: string,
  method: FetchMethod = 'GET',
  {
    body,
    headers = {},
    cache,
    next,
    skipRefresh = false,
  }: FetchAPIOptions = {},
): Promise<T> {
  const t = await getTranslations('errors');

  const makeRequest = async (): Promise<Response> => {
    const cookieStore = await cookies();
    const locale = await getLocale();
    const accessToken = cookieStore.get('accessToken')?.value;

    const requestHeaders = new Headers(headers);

    requestHeaders.set('Cookie', cookieStore.toString());
    requestHeaders.set('Accept-Language', locale);
    requestHeaders.set('Accept', 'application/json');

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    if (body != null && !(body instanceof FormData)) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    try {
      console.log(
        `Making request to ${API_URL}${endpoint} with method ${method}`,
      );

      return await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        cache,
        next,
        body:
          body == null
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
      });
    } catch (error) {
      console.error('Fetch error:', error);

      throw new NetworkError(t('serverUnavailable'));
    }
  };

  let response = await makeRequest();

  // Try refreshing only when allowed
  if (response.status === 401 && !skipRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      response = await makeRequest();
    }
  }

  const rawBody = await response.text();

  let data: unknown = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = rawBody;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : response.status === 401
          ? 'Unauthorized'
          : undefined;

    throw new APIError(response.status, data, message);
  }

  return data as T;
}

