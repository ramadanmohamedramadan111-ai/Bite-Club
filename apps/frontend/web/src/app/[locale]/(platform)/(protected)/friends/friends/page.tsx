import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import FriendsTab from '@/components/social/friends/FriendsTab';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function FriendsTabPage({ searchParams }: Props) {
  const { search, page = '1', per_page = '1' } = await searchParams;

  return (
    <Suspense fallback={<Spinner />}>
      <FriendsTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}
