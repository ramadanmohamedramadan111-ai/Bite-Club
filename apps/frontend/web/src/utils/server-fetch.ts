import { cookies } from 'next/headers';

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchAPIOptions {
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export async function serverFetch<T>(
  endpoint: string,
  method: FetchMethod = 'GET',
  { body, headers = {}, cache, next }: FetchAPIOptions = {},
): Promise<T> {
  const cookieStore = await cookies();

  const requestHeaders = new Headers(headers);

  requestHeaders.set('Cookie', cookieStore.toString());

  if (!(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
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
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data?.message ?? 'Request failed');
  }

  return data as T;
}

