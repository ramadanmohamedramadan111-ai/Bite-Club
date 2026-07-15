import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import FriendsPage from '@/components/social/friends/FriendsPage';
import FriendsTab from '@/components/social/friends/FriendsTab';
import FriendsTabsNavigation from '@/components/social/friends/FriendsTabsNavigation';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { friendsSearchParamsSchema } from '@/schemas/urls/friends-tabs-schema';
import { FriendsTabType } from '@/types/social/friends';
import { Tabs } from 'radix-ui';
import React from 'react';

export default async function page({
  searchParams,
}: {
  searchParams: { tab: FriendsTabType; search: string };
}) {
  const searchParamsValue = await searchParams;
  const { tab, search } = searchParamsValue;

  const result = friendsSearchParamsSchema.safeParse(searchParamsValue);

  if (!result) {
    return <InvalidSearchParams />;
  }

  return (
    <>
      <FriendsTabsNavigation tab={tab} />
      <FriendsTab search={search} />

      {/* <FriendsPage /> */}
    </>
  );
}

