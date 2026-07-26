export type NavItemId =
  | 'dashboard' | 'users' | 'blockedUsers' | 'restaurants' | 'categories'
  | 'orders' | 'payments' | 'commissions'
  | 'badges' | 'leaderboard' | 'feed'
  | 'settings' | 'profile'

export interface NavItem {
  id: NavItemId
  labelKey: string
  icon: React.ReactNode
  badge?: number
  section: string
}

function Svg({ d, stroke = 1.8 }: { d: string; stroke?: number }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d.split('|').map((p, i) => <path key={i} d={p.trim()} />)}
    </svg>
  )
}

const I = {
  bold: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><line x1="6" y1="4" x2="6" y2="20" /></svg>,
  dashboard: <Svg d="M3 3h7v7H3z|M14 3h7v7h-7z|M3 14h7v7H3z|M14 14h7v7h-7z" />,
  orders: <Svg d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2|M15 2v4H9V2z|M9 13h6|M9 17h6" />,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="8" r="3.5"/><path d="M21 19v-1.5a3.5 3.5 0 0 0-3.5-3.5H17"/></svg>,
  ban: <Svg d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z|M4.93 4.93l14.14 14.14" />,
  restaurants: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  categories: <Svg d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z|M2 10h20" />,
  payments: <Svg d="M3 10h18M7 15h1m4 0h1M3 6h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />,
  commissions: <Svg d="M12 20l9-16H3z|M6 9l6 6 6-6" />,
  badges: <Svg d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={1.6} />,
  leaderboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/><circle cx="12" cy="15" r="2" fill="currentColor" opacity="0.3"/></svg>,
  feed: <Svg d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z|M9 10h6|M9 14h6" />,
  settings: <Svg d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={1.6} />,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     labelKey: 'dashboard',     icon: I.dashboard,   section: 'main' },
  { id: 'orders',        labelKey: 'orders',        icon: I.orders,      section: 'main' },
  { id: 'users',         labelKey: 'users',         icon: I.users,       section: 'management' },
  { id: 'blockedUsers',  labelKey: 'blockedUsers',  icon: I.ban,         section: 'management' },
  { id: 'restaurants',   labelKey: 'restaurants',   icon: I.restaurants, section: 'management' },
  { id: 'categories',    labelKey: 'categories',    icon: I.categories,  section: 'management' },
  { id: 'payments',      labelKey: 'payments',      icon: I.payments,    section: 'finance' },
  { id: 'commissions',   labelKey: 'commissions',   icon: I.commissions, section: 'finance' },
  { id: 'badges',        labelKey: 'badges',        icon: I.badges,      section: 'engagement' },
  { id: 'leaderboard',   labelKey: 'leaderboard',   icon: I.leaderboard, section: 'engagement' },
  { id: 'feed',          labelKey: 'feed',          icon: I.feed,        section: 'moderation' },
  { id: 'settings',      labelKey: 'settings',      icon: I.settings,    section: 'system' },
  { id: 'profile',       labelKey: 'profile',       icon: I.profile,     section: 'system' },
]

export { I }
