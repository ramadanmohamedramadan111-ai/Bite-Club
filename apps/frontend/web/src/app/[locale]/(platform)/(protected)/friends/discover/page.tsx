import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import DiscoverTab from '@/components/social/friends/DiscoverTab';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function DiscoverTabPage({ searchParams }: Props) {
  const { search, page = '1', per_page = '1' } = await searchParams;

  return (
    <Suspense fallback={<Spinner />}>
      <DiscoverTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}
