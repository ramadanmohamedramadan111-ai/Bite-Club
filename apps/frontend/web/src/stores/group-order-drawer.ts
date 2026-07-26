import { create } from 'zustand';

type GroupOrderDrawerStore = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useGroupOrderDrawerStore = create<GroupOrderDrawerStore>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));
