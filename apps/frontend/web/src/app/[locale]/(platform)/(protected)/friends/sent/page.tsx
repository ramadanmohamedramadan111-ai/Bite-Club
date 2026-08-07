import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import SentTab from '@/components/friends/SentTab';
import { parseSearchParams, SearchPaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    per_page?: string;
  }>;
};

export default async function SentTabPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = parseSearchParams(SearchPaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { search, page = '1', per_page = '15' } = parsed.data;

  return (
    <Suspense fallback={<Spinner />}>
      <SentTab search={search} page={page} per_page={per_page} />
    </Suspense>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('friendsSent.title'),
    description: t('friendsSent.description'),
  };
}
