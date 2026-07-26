import { create } from 'zustand';
import type { GroupOrderSession } from '@/types/group-order/group-order';

type GroupOrderSessionsStore = {
  sessions: GroupOrderSession[];
  setSessions: (sessions: GroupOrderSession[]) => void;
};

export const useGroupOrderSessionsStore = create<GroupOrderSessionsStore>()(
  (set) => ({
    sessions: [],
    setSessions: (sessions) => set({ sessions }),
  }),
);
