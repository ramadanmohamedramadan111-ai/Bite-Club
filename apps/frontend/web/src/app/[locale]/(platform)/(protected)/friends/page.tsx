import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import DiscoverTab from '@/components/social/friends/DiscoverTab';
import FriendsTab from '@/components/social/friends/FriendsTab';
import FriendsTabsNavigation from '@/components/social/friends/FriendsTabsNavigation';
import ReceivedTab from '@/components/social/friends/ReceivedTab';
import SearchUsers from '@/components/social/friends/SearchUsers';
import SentTab from '@/components/social/friends/SentTab';
import { Spinner } from '@/components/ui/spinner';
import { friendsSearchParamsSchema } from '@/schemas/urls/friends-tabs-schema';
import { FriendsTabType } from '@/types/social/friends';
import { Suspense } from 'react';

export default async function page({
  searchParams,
}: {
  searchParams: { tab: FriendsTabType; search: string };
}) {
  const searchParamsValue = await searchParams;
  const { tab = 'friends', search } = searchParamsValue;

  const result = friendsSearchParamsSchema.safeParse(searchParamsValue);

  if (!result) {
    return <InvalidSearchParams />;
  }

  return (
    <>
      <FriendsTabsNavigation tab={tab} />

      <SearchUsers />

      {tab === 'friends' && (
        <Suspense fallback={<Spinner />}>
          <FriendsTab search={search} />
        </Suspense>
      )}
      {tab === 'discover' && (
        <Suspense fallback={<Spinner />}>
          <DiscoverTab search={search} />
        </Suspense>
      )}

      {tab === 'sent' && (
        <Suspense fallback={<Spinner />}>
          <SentTab search={search} />
        </Suspense>
      )}

      {tab === 'received' && (
        <Suspense fallback={<Spinner />}>
          <ReceivedTab search={search} />
        </Suspense>
      )}

      {/* <FriendsPage /> */}
    </>
  );
}

