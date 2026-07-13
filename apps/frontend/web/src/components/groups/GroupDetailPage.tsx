'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import GroupHistoryTab from '@/components/groups/GroupHistoryTab';
import GroupImage from '@/components/groups/GroupImage';
import GroupMembersTab from '@/components/groups/GroupMembersTab';
import GroupSettingsTab from '@/components/groups/GroupSettingsTab';
import GroupTabs from '@/components/groups/GroupTabs';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useGroupSessionsStore } from '@/stores/group-sessions';
import { useGroupsStore } from '@/stores/groups';
import type { Group, GroupTab } from '@/types/group/group';

type Props = {
  groupId: string;
};

function GroupDetailContent({ group }: { group: Group }) {
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'members') as GroupTab;

  return (
    <>
      <Suspense
        fallback={<div className="h-10 animate-pulse rounded-lg bg-muted" />}>
        <GroupTabs groupId={group.id} />
      </Suspense>

      <div className="mt-6">
        {tab === 'members' && <GroupMembersTab group={group} />}
        {tab === 'history' && <GroupHistoryTab />}
        {tab === 'settings' && <GroupSettingsTab group={group} />}
      </div>
    </>
  );
}

export default function GroupDetailPage({ groupId }: Props) {
  const group = useGroupsStore((state) =>
    state.groups.find((entry) => entry.id === groupId),
  );
  const activeSession = useGroupSessionsStore((state) =>
    state.getActiveSessionForGroup(groupId),
  );

  if (!group) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <p className="mt-2 text-muted-foreground">
          This group does not exist or you do not have access.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <GroupImage
            src={group.image}
            alt={group.name}
            className="size-16 rounded-xl"
            fallbackClassName="size-16 rounded-xl"
          />
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="mt-1 text-muted-foreground">{group.description}</p>
          </div>
        </div>

        {activeSession && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/group-order/${activeSession.id}`}>
              <ExternalLink className="size-4" />
              Active group order
            </Link>
          </Button>
        )}
      </div>

      <Suspense
        fallback={<div className="h-10 animate-pulse rounded-lg bg-muted" />}>
        <GroupDetailContent group={group} />
      </Suspense>
    </div>
  );
}
