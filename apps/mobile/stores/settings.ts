import { Appearance } from 'react-native';
import { create } from 'zustand';

import { detectLocale, type Locale } from '@/lib/translations';
import { getItem, setItem } from '@/lib/storage';
import { LOCALE_STORAGE_KEY, THEME_STORAGE_KEY } from '@/lib/config';

export type ThemeMode = 'light' | 'dark' | 'system';
export type { Locale };

function applyTheme(mode: ThemeMode) {
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(mode === 'system' ? null : mode);
  }
}

type SettingsStore = {
  locale: Locale;
  theme: ThemeMode;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  hydrate: () => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  locale: detectLocale(),
  theme: 'system',
  hydrated: false,

  setLocale: (locale) => {
    set({ locale });
    setItem(LOCALE_STORAGE_KEY, locale);
  },

  setTheme: (theme) => {
    set({ theme });
    setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  },

  hydrate: async () => {
    const [localeRaw, themeRaw] = await Promise.all([
      getItem(LOCALE_STORAGE_KEY),
      getItem(THEME_STORAGE_KEY),
    ]);
    let locale: Locale = detectLocale();
    if (localeRaw === 'en' || localeRaw === 'ar') locale = localeRaw;
    const theme: ThemeMode =
      themeRaw === 'light' || themeRaw === 'dark' || themeRaw === 'system' ? themeRaw : 'system';
    applyTheme(theme);
    set({ locale, theme, hydrated: true });
  },
}));