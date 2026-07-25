import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import ReceivedTab from '@/components/social/friends/ReceivedTab';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function ReceivedTabPage({ searchParams }: Props) {
  const { search, page = '1', per_page = '1' } = await searchParams;

  return (
    <Suspense fallback={<Spinner />}>
      <ReceivedTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}
