import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent } from '@/components/ui/card';
import { Segmented, type SegmentedOption } from '@/components/ui/segmented';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n, applyLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/translations';
import { useSettingsStore, type ThemeMode } from '@/stores/settings';

const localeOptions: SegmentedOption<Locale>[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <Card>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const theme = useSettingsStore((s) => s.theme);
  const locale = useSettingsStore((s) => s.locale);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const handleLocale = (value: Locale) => {
    setLocale(value);
    applyLocale(value);
  };

  const themeOptions: SegmentedOption<ThemeMode>[] = [
    { value: 'light', label: t('settings.theme.light') },
    { value: 'dark', label: t('settings.theme.dark') },
    { value: 'system', label: t('settings.theme.system') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('settings.subtitle')}
        </Text>

        <SettingsCard title={t('settings.language')}>
          <Segmented options={localeOptions} value={locale} onChange={handleLocale} />
        </SettingsCard>

        <SettingsCard title={t('settings.theme')}>
          <Segmented options={themeOptions} value={theme} onChange={setTheme} />
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  labelWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});