'use client';

import { useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { socialUsers } from '@/data/social-users';
import { useGroupsStore } from '@/stores/groups';
import type { Group, GroupMember } from '@/types/groups/groups';

type Props = {
  group: Group;
};

export default function GroupMembersTab({ group }: Props) {
  const addMember = useGroupsStore((state) => state.addMember);
  const removeMember = useGroupsStore((state) => state.removeMember);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // const existingMemberIds = new Set(
  //   group.members.map((member) => member.userId),
  // );

  // function handleAddMember(user: (typeof socialUsers)[number]) {
  //   const member: GroupMember = {
  //     id: crypto.randomUUID(),
  //     userId: user.id,
  //     name: user.name,
  //     username: user.username,
  //     avatar: user.avatar,
  //     isOwner: false,
  //   };

  //   addMember(group.id, member);
  //   toast.success(`${user.name} added to the group`);
  //   setAddDialogOpen(false);
  // }

  // function handleRemoveMember(member: GroupMember) {
  //   if (member.isOwner) {
  //     toast.error('Cannot remove the group owner');
  //     return;
  //   }

  //   removeMember(group.id, member.id);
  //   toast.success(`${member.name} removed from the group`);
  // }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {group.members.length} member
          {group.members.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="size-4" />
          Add member
        </Button>
      </div>

      <div className="space-y-2">
        {group.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatar ?? undefined} />
                <AvatarFallback>{member.full_name}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.full_name}
                  {member.isOwner && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Owner)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{member.username}
                </p>
              </div>
            </div>

            {!member.isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                // onClick={() => handleRemoveMember(member)}
              >
                <UserMinus className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>Add a friend to {group.name}</DialogDescription>
          </DialogHeader>

          {/* <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No friends available to add
              </p>
            ) : (
              availableFriends.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => handleAddMember(user)}>
                  <Avatar>
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div> */}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

