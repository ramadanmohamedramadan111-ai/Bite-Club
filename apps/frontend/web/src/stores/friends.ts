import { create } from 'zustand';

type FriendsStore = {
  count: number;
  setCount: (count: number) => void;
};

export const useFriendsStore = create<FriendsStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));

