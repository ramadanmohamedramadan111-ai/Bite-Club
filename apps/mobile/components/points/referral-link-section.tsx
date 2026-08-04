import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { buildReferralLink } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth';

export function ReferralLinkSection() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t, locale } = useI18n();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const referralCode = useAuthStore((s) => s.user?.referral_code);
  const link = referralCode ? buildReferralLink(referralCode, locale) : null;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await Clipboard.setStringAsync(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert(t('points.referralCopyFailed'));
    }
  };

  const handleShare = async () => {
    if (!link) return;
    try {
      await Share.share({ message: `${t('points.referralShareMessage')} ${link}` });
    } catch {
      // share dismissed or failed — ignore
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <Ionicons name="share-social" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.headerBody}>
          <Text style={[styles.title, { color: colors.text }]}>{t('points.referralTitle')}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {t('points.referralDesc')}
          </Text>
        </View>
      </View>

      <View style={[styles.linkBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>
          {link ?? '—'}
        </Text>
        <Pressable
          onPress={handleCopy}
          accessibilityRole="button"
          style={[styles.copyBtn, { backgroundColor: copied ? colors.success : colors.primary }]}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color="#FFFFFF" />
          <Text style={styles.copyText}>{copied ? t('points.referralCopied') : t('points.copyLink')}</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handleShare} accessibilityRole="button" style={[styles.shareBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="share-outline" size={16} color="#FFFFFF" />
          <Text style={styles.shareText}>{t('points.referralShare')}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/points/referrals')}
          accessibilityRole="button"
          style={[styles.viewBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.viewText, { color: colors.text }]}>{t('points.viewReferrals')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '800' },
  desc: { fontSize: 12, lineHeight: 16 },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  linkText: { flex: 1, fontSize: 12, fontWeight: '600' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  copyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 42,
    borderRadius: Radius.md,
  },
  shareText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  viewText: { fontSize: 13, fontWeight: '700' },
});
