import { create } from 'zustand';

import { getItem, removeItem, setItem } from '@/lib/storage';

export type SavedLocation = {
  lat: number;
  lng: number;
  area: string;
  address: string;
};

const LOCATION_STORAGE_KEY = 'biteclub.location';

type LocationStore = {
  location: SavedLocation | null;
  hydrated: boolean;
  setLocation: (location: SavedLocation) => void;
  clearLocation: () => void;
  hydrate: () => Promise<void>;
};

export const useLocationStore = create<LocationStore>((set) => ({
  location: null,
  hydrated: false,

  setLocation: (location) => {
    set({ location });
    setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  },

  clearLocation: () => {
    set({ location: null });
    removeItem(LOCATION_STORAGE_KEY);
  },

  hydrate: async () => {
    const raw = await getItem(LOCATION_STORAGE_KEY);
    if (raw) {
      try {
        const location = JSON.parse(raw) as SavedLocation;
        if (
          typeof location.lat === 'number' &&
          typeof location.lng === 'number'
        ) {
          set({ location, hydrated: true });
          return;
        }
      } catch {
        // fall through
      }
    }
    set({ location: null, hydrated: true });
  },
}));
