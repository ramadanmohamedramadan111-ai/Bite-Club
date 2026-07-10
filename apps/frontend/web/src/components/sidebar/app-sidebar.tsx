'use client';

import * as React from 'react';

import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavUser } from '@/components/sidebar/nav-user';
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
  Gift,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const side = direction === 'rtl' ? 'right' : 'left';
  const t = useTranslations('sidebar');
  const itemCount = useCartStore(
    (state) =>
      state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
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
        name: t('gifts'),
        url: '/gifts',
        icon: Gift,
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
