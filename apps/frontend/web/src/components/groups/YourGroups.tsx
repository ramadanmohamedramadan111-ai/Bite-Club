import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import AppSearch from '../shared/AppSearch';
import YourGroupsFetching from './YourGroupsFetching';
import { Spinner } from '../ui/spinner';
import { SearchPaginatedType } from '@/types/common';

export default async function YourGroups({
  search,
  page,
  per_page,
}: SearchPaginatedType) {
  const t = await getTranslations('groups');

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t('yourGroups')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('yourGroupsDesc')}
          </p>
        </div>
        <AppSearch route="groups" />
      </div>
      <Suspense fallback={<Spinner />}>
        <YourGroupsFetching search={search} page={page} per_page={per_page} />
      </Suspense>
    </section>
  );
}

