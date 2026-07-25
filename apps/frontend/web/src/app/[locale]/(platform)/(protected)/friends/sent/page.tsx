import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import SentTab from '@/components/social/friends/SentTab';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function SentTabPage({ searchParams }: Props) {
  const { search, page = '1', per_page = '1' } = await searchParams;

  return (
    <Suspense fallback={<Spinner />}>
      <SentTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}
