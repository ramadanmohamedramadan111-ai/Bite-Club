'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FriendsTabType } from '@/types/social/friends';
import React from 'react';

export default function FriendsTabsNavigation({
  tab,
}: {
  tab: FriendsTabType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams);

    params.set('tab', value);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs defaultValue="friends" value={tab} onValueChange={handleTabChange}>
      <TabsList
        className="
          w-full
          grid
          grid-cols-2
          lg:grid-cols-4
        ">
        <TabsTrigger value="friends">Friends</TabsTrigger>
        <TabsTrigger value="received">Received Requests</TabsTrigger>
        <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        <TabsTrigger value="discover">Discover Users</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

