import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent } from '@/components/ui/card';
import { DirectionalIcon } from '@/components/ui/directional-icon';
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



export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
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

        {/* Preferences Group */}
        <Card style={styles.groupCard}>
          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <Ionicons name="settings-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.settingGroupTitle, { color: colors.text }]}>
                {t('settings.title')}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.itemTitleRow}>
                <Ionicons name="globe-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.itemLabel, { color: colors.text }]}>{t('settings.language')}</Text>
              </View>
              <Segmented options={localeOptions} value={locale} onChange={handleLocale} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.itemTitleRow}>
                <Ionicons name="color-palette-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.itemLabel, { color: colors.text }]}>{t('settings.theme')}</Text>
              </View>
              <Segmented options={themeOptions} value={theme} onChange={setTheme} />
            </View>
          </View>
        </Card>

        {/* Legal & Policies Group */}
        <Card style={styles.groupCard}>
          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.settingGroupTitle, { color: colors.text }]}>
                {t('settings.legal')}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/privacy-policy')}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
            >
              <View style={styles.itemTitleRow}>
                <Ionicons name="shield-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.linkText, { color: colors.text }]}>
                  {t('settings.privacyPolicy')}
                </Text>
              </View>
              <DirectionalIcon name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() => router.push('/terms-of-service')}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
            >
              <View style={styles.itemTitleRow}>
                <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.linkText, { color: colors.text }]}>
                  {t('settings.termsOfService')}
                </Text>
              </View>
              <DirectionalIcon name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </Card>
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
  groupCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingGroup: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  settingItem: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
