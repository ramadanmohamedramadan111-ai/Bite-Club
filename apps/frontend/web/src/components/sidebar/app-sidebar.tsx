'use client';

import * as React from 'react';

import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavUser, type SidebarUser } from '@/components/sidebar/nav-user';
import { TeamSwitcher } from '@/components/sidebar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  BellIcon,
  CircleUserRound,
  Coins,
  Handshake,
  Heart,
  House,
  Logs,
  Newspaper,
  Settings,
  ShoppingCartIcon,
  Users,
  Utensils,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { useCartStore } from '@/stores/cart';

import { useUnreadNotificationCount } from '@/lib/const-data';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser | null }) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const side = direction === 'rtl' ? 'right' : 'left';
  const t = useTranslations('sidebar');
  const itemCount = useCartStore(
    (state) =>
      state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  const unreadNotifications = useUnreadNotificationCount();

  const data = {
    projects: [
      {
        name: t('home'),
        url: '/',
        icon: House,
      },
      {
        name: t('restaurants'),
        url: '/restaurants',
        icon: Utensils,
      },
      {
        name: t('orders'),
        url: '/orders',
        icon: Logs,
      },
      {
        name: t('points'),
        url: '/points',
        icon: Coins,
      },
      {
        name: t('groups'),
        url: '/groups',
        icon: Users,
      },
      {
        name: t('profile'),
        url: '/profile',
        icon: CircleUserRound,
      },
      {
        name: t('friends'),
        url: '/friends',
        icon: Handshake,
      },
      {
        name: t('feed'),
        url: '/feed',
        icon: Newspaper,
      },
      {
        name: t('favorites'),
        url: '/favorites',
        icon: Heart,
      },
      {
        name: t('settings'),
        url: '/settings',
        icon: Settings,
      },
      {
        name: t('notifications'),
        url: '/notifications',
        icon: BellIcon,
        badge: unreadNotifications,
      },
      {
        name: t('cart'),
        url: '/cart',
        icon: ShoppingCartIcon,
        badge: itemCount,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props} side={side}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

