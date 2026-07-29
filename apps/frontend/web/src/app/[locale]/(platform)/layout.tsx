import React from 'react';
import { getTranslations } from 'next-intl/server';

import SearchForm from '@/components/navbar/SearchForm';
import LocationButtonServer from '@/components/location/location-button-server';
import CartDrawerHost from '@/components/cart/CartDrawerHost';
import GroupOrderSessionsDrawerHost from '@/components/navbar/GroupOrderSessionsDrawerHost';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Cart } from '@/types/cart';
import AuthInitializer from '@/Initializers/AuthInitializer';
import { FriendResponseType } from '@/types/friends';
import FriendsInitializer from '@/Initializers/FriendsInitializer';
import { UserMeResponse } from '@/types/auth';
import type { WalletDetails, StreakDetails } from '@/types/points';
import GamificationInitializer from '@/Initializers/GamificationInitializer';
import GroupOrderSessionsInitializer from '@/Initializers/GroupOrderSessionsInitializer';
import type { GroupOrderSession } from '@/types/group-order';
import GamificationPopover from '@/components/gamification/GamificationPopover';
import { CartInitializer } from '@/Initializers/CartInitializer';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import AIChat from '@/components/ai/AIChat';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('gamification');

  let user = null;
  let cart = null;
  let friendsRequestsCount = 0;
  let wallet: WalletDetails | null = null;
  let streak: StreakDetails | null = null;
  let activeGroupOrderSessions: GroupOrderSession[] = [];

  try {
    const res = await serverFetch<ApiResponse<UserMeResponse>>(
      '/user/me',
      'GET',
      {
        skipRefresh: true,
      },
    );
    user = res?.data ?? null;
    console.log('USER', user);
  } catch (error) {
    console.log('Failed to fetch user in layout:', error);
  }

  const userId = await getUserId();

  if (userId) {
    try {
      const res = await serverFetch<ApiResponse<Cart>>('/user/cart', 'GET', {
        next: {
          tags: ['cart', `cart-${userId}`],
        },
      });

      const requestsData = await serverFetch<
        ApiResponse<PaginatedResponse<FriendResponseType>>
      >(`/friends/requests`, 'GET', {
        next: {
          tags: ['friends-requests', `friends-requests-${userId}`],
        },
      });
      friendsRequestsCount = requestsData.data?.meta?.total ?? 0;

      cart = res.data;

      try {
        const sessionsRes = await serverFetch<ApiResponse<GroupOrderSession[]>>(
          '/user/group-orders/active-sessions',
          'GET',
          {
            next: {
              tags: ['group-order-sessions', `group-order-sessions-${userId}`],
            },
          },
        );
        activeGroupOrderSessions =
          sessionsRes?.data?.filter(
            (s) => s.status === 'open' || s.status === 'locked',
          ) ?? [];
      } catch (error) {
        console.log('Failed to fetch group order sessions in layout:', error);
      }
    } catch (error) {
      console.log('Failed to fetch cart in layout:', error);
    }

    try {
      const [walletRes, streakRes] = await Promise.all([
        serverFetch<ApiResponse<WalletDetails>>('/wallet', 'GET', {
          next: { tags: [`wallet-${userId}`] },
        }),
        serverFetch<ApiResponse<StreakDetails>>('/wallet/streak', 'GET', {
          next: { tags: [`streak-${userId}`] },
        }),
      ]);
      wallet = walletRes.data;
      streak = streakRes.data;
    } catch (error) {
      console.log('Failed to fetch wallet/streak in layout:', error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dot-pattern">
      <CartInitializer cart={cart} />
      <AuthInitializer isAuthenticated={!!userId} />
      <FriendsInitializer count={friendsRequestsCount} />
      <GamificationInitializer wallet={wallet} streak={streak} />
      <GroupOrderSessionsInitializer sessions={activeGroupOrderSessions} />

      <Navbar
        user={user}
        friendsRequestsCount={friendsRequestsCount}
        locationButton={<LocationButtonServer />}
        searchForm={<SearchForm />}
        gamificationPopover={!!userId ? <GamificationPopover /> : null}
      />

      <main className="flex-1 px-4 sm:px-6 md:px-8 xl:px-12 py-6 max-w-7xl mx-auto w-full">
        {children}
        <AIChat />
      </main>

      <Footer />

      <CartDrawerHost />
      <GroupOrderSessionsDrawerHost />
    </div>
  );
}

