export const API_BASE_URL = 'http://192.168.1.85:8080/api';

export const TOKEN_STORAGE_KEY = 'biteclub.accessToken';
export const USER_STORAGE_KEY = 'biteclub.user';
export const LOCALE_STORAGE_KEY = 'biteclub.locale';
export const THEME_STORAGE_KEY = 'biteclub.theme';

const base = new URL(API_BASE_URL);

export const REVERB_APP_KEY = '7shjlvmsslgdjgltf46x';
export const REVERB_HOST = base.hostname;
export const REVERB_PORT = 8081;

export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    u.hostname = base.hostname;
    u.port = base.port;
    return u.toString();
  } catch {
    return url;
  }
}

export function buildReferralLink(code: string, locale: string): string {
  return `${base.origin}/${locale}/register?referrer_code=${encodeURIComponent(code)}`;
}