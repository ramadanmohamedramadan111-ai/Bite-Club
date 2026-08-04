import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyLocale } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settings';

function AuthSettingsBar() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const isDark = scheme === 'dark';
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const selectLocale = (next: 'en' | 'ar') => {
    if (next !== locale) {
      setLocale(next);
      applyLocale(next);
    }
  };

  return (
    <View style={[styles.bar, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Pressable
        onPress={toggleTheme}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'switch to light' : 'switch to dark'}>
        <Ionicons
          name={isDark ? 'moon-outline' : 'sunny-outline'}
          size={18}
          color={isDark ? '#E8B44A' : '#F59E0B'}
        />
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.lang}>
        {(['en', 'ar'] as const).map((code) => {
          const active = locale === code;
          return (
            <Pressable
              key={code}
              onPress={() => selectLocale(code)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text
                style={[
                  styles.langText,
                  { color: active ? colors.primary : colors.textSecondary },
                  active && styles.langActive,
                ]}>
                {code === 'en' ? 'EN' : 'AR'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default AuthSettingsBar;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
  },
  lang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  langActive: {
    fontWeight: '800',
  },
});