const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}

export function getAuthToken(): string | null {
  return getCookie(TOKEN_KEY)
}

export function setAuthToken(token: string) {
  setCookie(TOKEN_KEY, token)
}

export function removeAuthToken() {
  deleteCookie(TOKEN_KEY)
}

export function getAuthUser(): Record<string, unknown> | null {
  const raw = getCookie(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthUser(user: Record<string, unknown>) {
  setCookie(USER_KEY, JSON.stringify(user))
}

export function removeAuthUser() {
  deleteCookie(USER_KEY)
}

export function clearAuth() {
  removeAuthToken()
  removeAuthUser()
}
