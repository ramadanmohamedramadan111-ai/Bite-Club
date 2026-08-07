import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import DiscoverTab from '@/components/friends/DiscoverTab';
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

export default async function DiscoverTabPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = parseSearchParams(SearchPaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { search, page = '1', per_page = '10' } = parsed.data;

  return (
    <Suspense fallback={<Spinner />}>
      <DiscoverTab search={search} page={String(page)} per_page={String(per_page)} />
    </Suspense>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('friendsDiscover.title'),
    description: t('friendsDiscover.description'),
  };
}
