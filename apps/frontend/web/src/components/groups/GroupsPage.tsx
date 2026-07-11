'use client';

import { useGroupsStore } from '@/stores/groups';

import ActiveSessionsSection from './ActiveSessionsSection';
import CreateGroupDialog from './CreateGroupDialog';
import GroupCard from './GroupCard';

export default function GroupsPage() {
  const groups = useGroupsStore((state) => state.groups);

  return (
    <div className="container mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your groups and join active group order sessions.
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      <ActiveSessionsSection />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Your groups</h2>
          <p className="text-sm text-muted-foreground">
            Groups you belong to for shared ordering
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="text-muted-foreground">You are not in any groups yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
