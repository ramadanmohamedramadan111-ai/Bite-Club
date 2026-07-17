import GroupsHeader from '@/components/groups/GroupsHeader';
import YourGroups from '@/components/groups/YourGroups';
import { SearchPaginatedType } from '@/types/common';

export default async function Page({
  searchParams,
}: {
  searchParams: SearchPaginatedType;
}) {
  const searchParamsValue = await searchParams;
  const { search, page = '1', per_page = '1' } = searchParamsValue;

  return (
    <div className="container mx-auto space-y-8">
      <GroupsHeader />

      {/* <ActiveSessionsSection /> */}
      <YourGroups search={search} page={page} per_page={per_page} />
    </div>
  );
}

