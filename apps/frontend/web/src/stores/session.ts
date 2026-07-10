import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionStore = {
  sessionId: string | null;

  name: string | null;

  initializeSession: () => void;

  setName: (name: string) => void;

  clearName: () => void;

  clearSession: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessionId: null,

      name: null,

      initializeSession: () =>
        set((state) => {
          if (state.sessionId) {
            return state;
          }

          return {
            sessionId: crypto.randomUUID(),
          };
        }),

      setName: (name) =>
        set({
          name,
        }),

      clearName: () =>
        set({
          name: null,
        }),

      clearSession: () =>
        set({
          sessionId: null,
          name: null,
        }),
    }),

    {
      name: 'biteclub-session',
    },
  ),
);
