'use client';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('friends');
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
        <TabsTrigger value="friends">{t('friends')}</TabsTrigger>
        <TabsTrigger value="received">{t('receivedRequests')}</TabsTrigger>
        <TabsTrigger value="sent">{t('sentRequests')}</TabsTrigger>
        <TabsTrigger value="discover">{t('discover')}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

