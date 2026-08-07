import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import GroupsHeader from '@/components/groups/GroupsHeader';
import YourGroups from '@/components/groups/YourGroups';
import ActiveSessionsPanel from '@/components/groups/ActiveSessionsPanel';
import { parseSearchParams, SearchPaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; per_page?: string }>;
}) {
  const raw = await searchParams;
  const parsed = parseSearchParams(SearchPaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { search, page = '1', per_page = '15' } = parsed.data;

  return (
    <div className="container mx-auto space-y-8">
      <GroupsHeader />
      <ActiveSessionsPanel />
      <YourGroups search={search} page={page} per_page={per_page} />
    </div>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('groups.title'),
    description: t('groups.description'),
  };
}
