const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      (data as { message?: string }).message ??
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data as T
}

export const api = {
  post: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body, token }),
}
