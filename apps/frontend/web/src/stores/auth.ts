import { create } from 'zustand';

type AuthStore = {
  isAuthenticated: boolean;

  setAuthenticated: (isAuthenticated: boolean) => void;

  login: () => void;

  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  login: () => set({ isAuthenticated: true }),

  logout: () => set({ isAuthenticated: false }),
}));

