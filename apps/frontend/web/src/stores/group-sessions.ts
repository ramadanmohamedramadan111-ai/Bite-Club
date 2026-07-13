import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ActiveGroupSession } from '@/types/group/group';

type GroupSessionsStore = {
  sessions: ActiveGroupSession[];

  addSession: (session: ActiveGroupSession) => void;

  removeSession: (sessionId: string) => void;

  getSessionById: (sessionId: string) => ActiveGroupSession | undefined;

  getActiveSessionsForGroups: (groupIds: string[]) => ActiveGroupSession[];

  getActiveSessionForGroup: (groupId: string) => ActiveGroupSession | undefined;
};

export const useGroupSessionsStore = create<GroupSessionsStore>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => ({
          sessions: [
            session,
            ...state.sessions.filter((entry) => entry.id !== session.id),
          ],
        })),

      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== sessionId),
        })),

      getSessionById: (sessionId) =>
        get().sessions.find((session) => session.id === sessionId),

      getActiveSessionsForGroups: (groupIds) =>
        get().sessions.filter(
          (session) => session.groupId && groupIds.includes(session.groupId),
        ),

      getActiveSessionForGroup: (groupId) =>
        get().sessions.find((session) => session.groupId === groupId),
    }),
    {
      name: 'biteclub-group-sessions',
    },
  ),
);
