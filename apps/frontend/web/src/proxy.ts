import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import {
  anonymousRoutes,
  protectedRoutes,
  publicRoutes,
  matchRoute,
} from './routes';

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function isAuthenticated(token?: string) {
  if (!token) return false;

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function normalize(path: string) {
  return path.replace(/^\/|\/$/g, '');
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const segments = pathname.split('/').filter(Boolean);

  const locale = routing.locales.includes(
    segments[0] as (typeof routing.locales)[number],
  )
    ? segments[0]
    : routing.defaultLocale;

  const route = normalize(
    segments[0] === locale ? segments.slice(1).join('/') : segments.join('/'),
  );

  const token = request.cookies.get('accessToken')?.value;
  const authenticated = await isAuthenticated(token);

  const matches = (patterns: readonly string[]) =>
    patterns.some((pattern) => matchRoute(normalize(pattern), route));

  // Protected pages
  if (matches(protectedRoutes)) {
    if (!authenticated) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname + search);

      return NextResponse.redirect(loginUrl);
    }

    return intlMiddleware(request);
  }

  // Guest-only pages
  if (matches(anonymousRoutes)) {
    if (authenticated) {
      return NextResponse.redirect(new URL(`/${locale}/feed`, request.url));
    }

    return intlMiddleware(request);
  }

  // Public pages
  if (matches(publicRoutes)) {
    return intlMiddleware(request);
  }

  // Everything else (404, future routes, etc.)
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
