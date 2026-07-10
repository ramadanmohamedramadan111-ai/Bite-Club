import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import { anonymousRoutes, protectedRoutes } from './routes';

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET!,
);

function normalizeRoute(route: string) {
  return route.replace(/^\/+|\/+$/g, '');
}

async function isAuthenticated(token?: string) {
  if (!token) return false;

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const { pathname, search } = request.nextUrl;

  const segments = pathname.split('/').filter(Boolean);
  const locales = routing.locales;

  // Remove locale prefix and normalize the route.
  // Examples:
  // /en/dashboard      -> dashboard
  // /en/dashboard/     -> dashboard
  // /ar/login          -> login
  // /en                -> ""
  const route = normalizeRoute(
    locales.includes(segments[0] as (typeof locales)[number])
      ? segments.slice(1).join('/')
      : segments.join('/'),
  );

  const normalizedProtectedRoutes = protectedRoutes.map(normalizeRoute);
  const normalizedAnonymousRoutes = anonymousRoutes.map(normalizeRoute);

  const token = request.cookies.get('accessToken')?.value;
  const authenticated = await isAuthenticated(token);

  // Current locale
  const locale = locales.includes(segments[0] as (typeof locales)[number])
    ? segments[0]
    : routing.defaultLocale;

  // Protected routes
  if (
    normalizedProtectedRoutes.some(
      (r) => route === r || route.startsWith(`${r}/`),
    )
  ) {
    if (!authenticated) {
      const loginUrl = new URL(`/${locale}/login`, request.url);

      loginUrl.searchParams.set('redirect', pathname + search);

      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Anonymous-only routes
  if (
    normalizedAnonymousRoutes.some(
      (r) => route === r || route.startsWith(`${r}/`),
    )
  ) {
    if (authenticated) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url),
      );
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};

