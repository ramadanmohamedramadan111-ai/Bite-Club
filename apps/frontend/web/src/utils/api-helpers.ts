import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

type QueryValue = string | number | boolean | null | undefined;

export function buildQueryString<T extends Record<string, QueryValue>>(
  params: T,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export async function getUserId() {
  const token = (await cookies()).get('token')?.value;

  if (!token) return null;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  return payload.sub;
}

