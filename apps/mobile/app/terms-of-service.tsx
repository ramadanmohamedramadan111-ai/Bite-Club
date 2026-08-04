import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent } from '@/components/ui/card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { TERMS_DATA } from '@/constants/legal-data';

export default function TermsOfServiceScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { locale } = useI18n();

  const data = locale === 'ar' ? TERMS_DATA.ar : TERMS_DATA.en;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navbar */}
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {data.title}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{data.subtitle}</Text>
          <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{data.lastUpdated}</Text>
          </View>
        </View>

        {/* Sections List */}
        <View style={styles.sectionsList}>
          {data.sections.map((section, idx) => (
            <Card key={idx} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
              </View>
              <CardContent style={styles.cardContent}>
                {section.body.map((paragraph, pIdx) => (
                  <Text key={pIdx} style={[styles.paragraph, { color: colors.text }]}>
                    {paragraph}
                  </Text>
                ))}
              </CardContent>
            </Card>
          ))}
        </View>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBack: {
    padding: Spacing.xs,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  navSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionsList: {
    gap: Spacing.md,
  },
  card: {
    overflow: 'hidden',
    padding: 0,
  },
  cardHeader: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 18,
  },
});
