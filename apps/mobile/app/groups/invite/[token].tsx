import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getApiErrorMessage, getApiMessage } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useInviteGroupDetail, useJoinGroupByLink } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';

export default function GroupInviteScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const inviteToken = String(token);
  const { data: group, isLoading, error } = useInviteGroupDetail(inviteToken);
  const joinGroupMutation = useJoinGroupByLink();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.text }]}>{t('groups.groupNotFound')}</Text>
        <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
          This invitation link is invalid, expired, or the group does not exist.
        </Text>
        <Button variant="outline" onPress={() => router.replace('/groups')} style={styles.backBtn}>
          Go to Groups
        </Button>
      </View>
    );
  }

  const handleJoin = () => {
    joinGroupMutation.mutate(inviteToken, {
      onSuccess: (response) => {
        Alert.alert(getApiMessage(response, t('groups.groupJoinedDesc', { name: group.name })));
        // Navigate to the group details page
        router.replace(`/groups/${group.id}`);
      },
      onError: (err) => {
        Alert.alert(getApiErrorMessage(err, t('common.genericError')));
      },
    });
  };

  const groupAvatar = resolveImageUrl(group.image_url);
  const initials = group.name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Back Button */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Glow ambient background effect */}
        <View style={styles.ambientGlowWrapper}>
          <LinearGradient
            colors={[colors.primary + '15', 'transparent']}
            style={styles.ambientGlow}
          />
        </View>

        {/* Card Body */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.cardAccentLine, { backgroundColor: colors.primary }]} />

          <View style={styles.cardBody}>
            {/* Glowing Avatar Wrapper */}
            <View style={styles.avatarBorderGlow}>
              <LinearGradient
                colors={[colors.primary, colors.gradientEnd]}
                style={styles.avatarGradientBorder}
              >
                {groupAvatar ? (
                  <Image source={groupAvatar} style={styles.groupAvatar} contentFit="cover" />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.fallbackLetter, { color: colors.primary }]}>{initials}</Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Invited Label */}
            <View style={[styles.invitedBadge, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.invitedBadgeText, { color: colors.primary }]}>
                {t('groups.invitedToJoin')}
              </Text>
            </View>

            {/* Group Title & Description */}
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>

            {group.description && (
              <View style={[styles.descriptionBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  "{group.description}"
                </Text>
              </View>
            )}

            {/* Stats display */}
            <View style={[styles.statsContainer, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              {/* Members stat */}
              <View style={[styles.statBox, { borderRightColor: colors.border + '50' }]}>
                <View style={[styles.statIconWrapper, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.statCount, { color: colors.text }]}>{group.members_count}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {group.members_count === 1 ? t('groups.member') : t('groups.members')}
                </Text>
              </View>

              {/* Owner stat */}
              <View style={styles.statBox}>
                <View style={[styles.statIconWrapper, { backgroundColor: colors.gradientEnd + '10' }]}>
                  <Ionicons name="ribbon" size={16} color={colors.gradientEnd} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                  {group.owner.full_name}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('groups.owner')}
                </Text>
              </View>
            </View>

            {/* Action button */}
            <Button
              variant="default"
              loading={joinGroupMutation.isPending}
              onPress={handleJoin}
              style={styles.joinBtn}
            >
              {t('groups.joinGroup')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backBtnWrapper: {
    padding: Spacing.xs,
    alignSelf: 'flex-start',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  ambientGlowWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    alignItems: 'center',
    zIndex: -1,
  },
  ambientGlow: {
    width: '100%',
    height: '100%',
  },
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardAccentLine: {
    height: 6,
  },
  cardBody: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  avatarBorderGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
    shadowColor: '#D94F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarGradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  groupAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLetter: {
    fontSize: 48,
    fontWeight: '900',
  },
  invitedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xl,
  },
  invitedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  descriptionBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: '100%',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'transparent',
    paddingHorizontal: Spacing.sm,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '900',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    maxWidth: '90%',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  joinBtn: {
    width: '100%',
    marginTop: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    minWidth: 120,
  },
});
