import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mockGroups } from '@/data/groups';
import type { Group, GroupMember } from '@/types/groups/groups';

function createInviteToken() {
  return `group-${crypto.randomUUID().slice(0, 8)}`;
}

type GroupsStore = {
  groups: Group[];

  createGroup: (data: {
    name: string;
    description: string;
    image?: string | null;
    owner: GroupMember;
  }) => Group;

  updateGroup: (
    groupId: string,
    data: Partial<
      Pick<Group, 'name' | 'description' | 'image' | 'invitationsOpen'>
    >,
  ) => void;

  addMember: (groupId: string, member: GroupMember) => void;

  removeMember: (groupId: string, memberId: string) => void;

  getGroupById: (groupId: string) => Group | undefined;

  resetGroups: () => void;
};

export const useGroupsStore = create<GroupsStore>()(
  persist(
    (set, get) => ({
      groups: mockGroups,

      createGroup: ({ name, description, image, owner }) => {
        const group: Group = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim(),
          image: image ?? null,
          inviteToken: createInviteToken(),
          invitationsOpen: true,
          members: [owner],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          groups: [group, ...state.groups],
        }));

        return group;
      },

      updateGroup: (groupId, data) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...data } : group,
          ),
        })),

      addMember: (groupId, member) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  members: group.members.some(
                    (existing) => existing.userId === member.userId,
                  )
                    ? group.members
                    : [...group.members, member],
                }
              : group,
          ),
        })),

      removeMember: (groupId, memberId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  members: group.members.filter(
                    (member) => member.id !== memberId,
                  ),
                }
              : group,
          ),
        })),

      getGroupById: (groupId) =>
        get().groups.find((group) => group.id === groupId),

      resetGroups: () =>
        set({
          groups: mockGroups,
        }),
    }),
    {
      name: 'biteclub-groups',
    },
  ),
);

