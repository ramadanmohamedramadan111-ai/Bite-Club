import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
            sessionId: generateUUID(),
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
