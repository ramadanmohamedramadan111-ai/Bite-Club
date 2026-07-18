import GroupTabs from './GroupTabs';
import GroupMembersTab from './GroupMembersTab';
import GroupHistoryTab from './GroupHistoryTab';
import GroupSettingsTab from './GroupSettingsTab';
import { GroupTab, GroupType } from '@/types/groups/groups';
import { getUserId } from '@/utils/api-helpers';
import { SearchPaginatedType } from '@/types/common';

export async function GroupDetailContent({
  group,
  tab,
  search,
  per_page,
  page,
}: SearchPaginatedType & {
  group: GroupType;
  tab: GroupTab;
}) {
  const userId = await getUserId();

  const isOwner = userId === group.owner.id;

  return (
    <>
      <GroupTabs groupId={group.id} />

      <div className="mt-6">
        {tab === 'members' && (
          <GroupMembersTab
            group={group}
            search={search}
            per_page={per_page}
            page={page}
          />
        )}
        {tab === 'history' && <GroupHistoryTab />}
        {tab === 'settings' && (
          <GroupSettingsTab group={group} isOwner={isOwner} />
        )}
      </div>
    </>
  );
}

