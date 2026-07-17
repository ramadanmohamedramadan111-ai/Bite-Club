import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import DiscoverTab from '@/components/social/friends/DiscoverTab';
import FriendsTab from '@/components/social/friends/FriendsTab';
import FriendsTabsNavigation from '@/components/social/friends/FriendsTabsNavigation';
import ReceivedTab from '@/components/social/friends/ReceivedTab';
import SearchUsers from '@/components/social/friends/SearchUsers';
import SentTab from '@/components/social/friends/SentTab';
import { Spinner } from '@/components/ui/spinner';
import { friendsSearchParamsSchema } from '@/schemas/urls/friends-tabs-schema';
import { SearchPaginatedType } from '@/types/common';
import { FriendsTabType } from '@/types/social/friends';
import { Suspense } from 'react';

export default async function page({
  searchParams,
}: {
  searchParams: SearchPaginatedType & {
    tab: FriendsTabType;
  };
}) {
  const searchParamsValue = await searchParams;
  const {
    tab = 'friends',
    search,
    page = '1',
    per_page = '1',
  } = searchParamsValue;

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
          <FriendsTab search={search} page={page} per_page={per_page} />
        </Suspense>
      )}
      {tab === 'discover' && (
        <Suspense fallback={<Spinner />}>
          <DiscoverTab search={search} page={page} per_page={per_page} />
        </Suspense>
      )}

      {tab === 'sent' && (
        <Suspense fallback={<Spinner />}>
          <SentTab search={search} page={page} per_page={per_page} />
        </Suspense>
      )}

      {tab === 'received' && (
        <Suspense fallback={<Spinner />}>
          <ReceivedTab search={search} page={page} per_page={per_page} />
        </Suspense>
      )}

      {/* <FriendsPage /> */}
    </>
  );
}

