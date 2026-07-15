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
