import { create } from 'zustand';

import { getItem, removeItem, setItem } from '@/lib/storage';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/lib/config';

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  profile_image?: string | null;
  referral_code?: string | null;
};

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  setAuth: (token: string, user: AuthUser) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hydrated: false,

  setToken: (token) => {
    set({ token, isAuthenticated: true });
    setItem(TOKEN_STORAGE_KEY, token);
  },

  setUser: (user) => {
    set({ user });
    setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  setAuth: (token, user) => {
    set({ token, user, isAuthenticated: true });
    setItem(TOKEN_STORAGE_KEY, token);
    setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  hydrate: async () => {
    const [token, userRaw] = await Promise.all([
      getItem(TOKEN_STORAGE_KEY),
      getItem(USER_STORAGE_KEY),
    ]);
    let user: AuthUser | null = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as AuthUser;
      } catch {
        user = null;
      }
    }
    if (token) {
      set({ token, user, isAuthenticated: true, hydrated: true });
    } else {
      set({ token: null, user: null, isAuthenticated: false, hydrated: true });
    }
  },

  logout: async () => {
    await Promise.all([removeItem(TOKEN_STORAGE_KEY), removeItem(USER_STORAGE_KEY)]);
    set({ token: null, user: null, isAuthenticated: false });
    void get();
  },
}));
