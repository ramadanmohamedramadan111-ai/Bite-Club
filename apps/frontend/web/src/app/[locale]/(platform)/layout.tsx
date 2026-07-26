import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Settings2 } from 'lucide-react';

import FullSelectors from '@/components/navbar/FullSelectors';
import SearchForm from '@/components/navbar/SearchForm';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import LocationButtonServer from '@/components/location/location-button-server';
import CartDrawerHost from '@/components/cart/CartDrawerHost';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { Cart, IndividualCartResponse } from '@/types/cart/cart';
import { CartInitializer } from '@/providers/CartInitilaizer';
import AuthInitializer from '@/providers/AuthInitializer';
import { FriendResponseType } from '@/types/social/friends';
import FriendsInitializer from '@/providers/FriendsInitializer';
import { UserMeResponse } from '@/types/auth/auth';
import type { WalletDetails, StreakDetails } from '@/types/points/points';
import GamificationInitializer from '@/providers/GamificationInitializer';
import GamificationPopover, {
  GamificationPanel,
  MobileGamificationButton,
} from '@/components/gamification/GamificationPopover';
import { Link } from '@/i18n/navigation';

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
    <SidebarProvider>
      <AppSidebar user={user} />
      <CartInitializer cart={cart} />
      <AuthInitializer isAuthenticated={!!userId} />
      <FriendsInitializer count={friendsRequestsCount} />
      <GamificationInitializer wallet={wallet} streak={streak} />

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 backdrop-blur gap-1 sm:gap-2 px-2 sm:px-4">
          <SidebarTrigger className="-ms-1 shrink-0" />
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div className="hidden lg:block shrink-0">
              <LocationButtonServer />
            </div>

            <div className="min-w-0 flex-1 max-w-[100px] sm:max-w-[180px] lg:max-w-md xl:max-w-lg">
              <SearchForm />
            </div>
          </div>
          {/* Gamification Desktop */}
          <div className="ms-1 hidden shrink-0 lg:block">
            <GamificationPopover />
          </div>

          {/* Desktop */}
          <div className="hidden shrink-0 lg:block">
            <FullSelectors />
          </div>
          {/* Mobile */}
          <div className="flex items-center gap-1 lg:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 gap-1 px-1.5">
                  <MobileGamificationButton />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                side="bottom"
                align="end"
                className="w-80 p-0"
                sideOffset={8}>
                <GamificationPanel />
                <div className="border-t p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    asChild>
                    <Link href="/points">{t('viewAllRewards')}</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-40 h-16 items-center justify-center p-2">
                <FullSelectors />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="min-h-[200vh] p-4">{children}</main>
      </SidebarInset>
      <CartDrawerHost />
    </SidebarProvider>
  );
}

