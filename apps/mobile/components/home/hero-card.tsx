import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/lib/i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function HeroCard() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { t } = useI18n();

  return (
    <LinearGradient
      colors={scheme === 'dark' ? ['#201511', colors.background, '#201511'] : ['#FBEFE8', colors.background, '#FDF3EC']}
      style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.blurA} />
      <View style={styles.blurB} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('hero.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('hero.subtitle')}
        </Text>
        <View style={styles.actions}>
          <Button onPress={() => router.push('/ai-chat')} size="lg" style={styles.cta}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.aiLabel}>{t('hero.ai')}</Text>
          </Button>
          <Button
            onPress={() => router.push('/restaurants')}
            variant="outline"
            size="lg"
            style={styles.cta}>
            {t('hero.cta')}
          </Button>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    overflow: 'hidden',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  blurA: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(217,79,42,0.12)',
  },
  blurB: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(249,115,22,0.08)',
  },
  content: {
    gap: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    alignSelf: 'stretch',
  },
  aiLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});