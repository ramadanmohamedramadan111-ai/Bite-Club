import CreateGroupDialog from './CreateGroupDialog';

export default function GroupsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Groups</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your groups and join active group order sessions.
        </p>
      </div>
      <CreateGroupDialog />
    </div>
  );
}

