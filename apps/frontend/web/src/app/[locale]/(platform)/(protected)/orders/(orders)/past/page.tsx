import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import PastOrders from '@/components/orders/PastOrders';
import { parseSearchParams, PaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

type Props = {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
  }>;
};

export default async function PastOrdersPage({ searchParams }: Props) {
  const tc = await getTranslations('common');
  const raw = await searchParams;
  const parsed = parseSearchParams(PaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { page = '1', per_page = '15' } = parsed.data;

  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">{tc('loadingOrders')}</div>}>
      <PastOrders page={Number(page)} perPage={Number(per_page)} />
    </Suspense>
  );
}


export const metadata: Metadata = {
  title: "Past Orders History | Bite Club",
  description: "Browse and reorder from your past culinary choices on Bite Club.",
};
