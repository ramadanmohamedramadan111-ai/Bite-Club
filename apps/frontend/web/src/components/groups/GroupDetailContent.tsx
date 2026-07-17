import GroupTabs from './GroupTabs';
import GroupMembersTab from './GroupMembersTab';
import GroupHistoryTab from './GroupHistoryTab';
import GroupSettingsTab from './GroupSettingsTab';
import { GroupTab, GroupType } from '@/types/groups/groups';
import { getUserId } from '@/utils/api-helpers';

export async function GroupDetailContent({
  group,
  tab,
}: {
  group: GroupType;
  tab: GroupTab;
}) {
  const userId = await getUserId();

  const isOwner = userId === group.owner.id;

  return (
    <>
      <GroupTabs groupId={group.id} />

      <div className="mt-6">
        {tab === 'members' && <GroupMembersTab group={group} />}
        {tab === 'history' && <GroupHistoryTab />}
        {tab === 'settings' && (
          <>
            {JSON.stringify(userId)}
            <GroupSettingsTab group={group} isOwner={isOwner} />
          </>
        )}
      </div>
    </>
  );
}

