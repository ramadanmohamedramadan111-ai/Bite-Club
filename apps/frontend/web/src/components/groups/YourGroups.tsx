import { Suspense } from 'react';
import AppSearch from '../shared/AppSearch';
import YourGroupsFetching from './YourGroupsFetching';
import { Spinner } from '../ui/spinner';
import { SearchPaginatedType } from '@/types/common';

export default function YourGroups({
  search,
  page,
  per_page,
}: SearchPaginatedType) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your groups</h2>
          <p className="text-sm text-muted-foreground">
            Groups you belong to for shared ordering
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

