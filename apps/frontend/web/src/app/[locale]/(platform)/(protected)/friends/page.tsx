import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import FriendsTab from '@/components/friends/FriendsTab';
import {
  parseSearchParams,
  SearchPaginatedParams,
} from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function FriendsTabPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = parseSearchParams(SearchPaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { search, page = '1', per_page = '10' } = parsed.data;

  return (
    <Suspense fallback={<Spinner />}>
      <FriendsTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}



export const metadata: Metadata = {
  title: "My Connections | Bite Club",
  description: "View and manage your network of friends on Bite Club.",
};
