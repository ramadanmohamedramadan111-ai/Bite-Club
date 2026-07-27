export const anonymousRoutes = [
  '/login',
  '/register',
  '/restaurant-register',
  '/forget-password',
] as const;

export const protectedRoutes = [
  '/notifications',
  '/profile',
  '/profile/edit',
  '/checkout',
  '/favorites',
  '/feed',
  '/feed/create',
  '/feed/posts',
  '/feed/leaderboard',
  '/posts/:postId',
  '/orders',
  '/orders/active',
  '/orders/past',
  '/orders/:orderId',
  '/points',
  '/points/referrals',
  '/points/history',
  '/groups',
  '/groups/:id',
  '/groups/:id/settings',
  '/groups/:id/members',
  '/groups/:id/history',
  '/groups/invite/:token',
  '/friends',
  '/friends/friends',
  '/friends/discover',
  '/friends/sent',
  '/friends/received',
  '/group-order/:id/checkout',
] as const;

export const publicRoutes = [
  '/',
  '/settings',
  '/cart',
  '/restaurants',
  '/restaurants/:id',
  '/restaurants/:id/info',
  '/restaurants/:id/reviews',
  '/items/:id',
  '/group-order/:id',
] as const;

export type RoutePattern = (
  | typeof anonymousRoutes
  | typeof protectedRoutes
  | typeof publicRoutes
)[number];

function normalize(path: string) {
  return path.replace(/^\/|\/$/g, '');
}

export function matchRoute(pattern: string, route: string) {
  const patternParts = normalize(pattern).split('/');
  const routeParts = normalize(route).split('/');

  if (patternParts.length !== routeParts.length) {
    return false;
  }

  return patternParts.every((segment, index) => {
    return segment.startsWith(':') || segment === routeParts[index];
  });
}
