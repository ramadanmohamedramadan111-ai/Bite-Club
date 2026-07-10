import { create } from 'zustand';

type CartDrawerStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartDrawerStore = create<CartDrawerStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));
