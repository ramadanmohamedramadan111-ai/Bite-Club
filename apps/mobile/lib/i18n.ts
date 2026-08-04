import { useCallback } from 'react';
import { DevSettings, I18nManager } from 'react-native';

import { translate, type Locale } from '@/lib/translations';
import { useSettingsStore } from '@/stores/settings';

export function applyLocale(locale: Locale) {
  const isRTL = locale === 'ar';
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    if (typeof DevSettings?.reload === 'function') {
      DevSettings.reload();
    }
  }
}

export function useI18n() {
  const locale = useSettingsStore((s) => s.locale);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale as Locale, key, params),
    [locale],
  );
  return { locale, t };
}