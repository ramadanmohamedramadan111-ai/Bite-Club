import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReferralLinkSection } from '@/components/points/referral-link-section';
import { PostCard } from '@/components/posts/post-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useProfile, useUserPosts } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { t } = useI18n();
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const profileQuery = useProfile();
  const user = profileQuery.data;

  const userPostsQuery = useUserPosts(1, 10);
  const userPosts = userPostsQuery.data?.items ?? [];

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/user/logout'),
    onSettled: () => {
      logout();
      router.replace('/login');
    },
  });

  const initials = user?.first_name ? user.first_name[0] : '';
  const avatarUrl = user?.profile_image ? resolveImageUrl(user.profile_image) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Text style={[styles.navTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        <View style={styles.navActions}>
          {isAuthenticated && user && (
            <Pressable
              onPress={() => router.push('/profile/edit')}
              hitSlop={10}
              accessibilityRole="button"
              style={[styles.editBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </Pressable>
          )}
          {isAuthenticated && (
            <Pressable
              onPress={() => logoutMutation.mutate()}
              hitSlop={10}
              accessibilityRole="button"
              disabled={logoutMutation.isPending}
              style={[styles.logoutBtn, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '40' }]}
            >
              {logoutMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.destructive} />
              ) : (
                <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isAuthenticated ? (
          profileQuery.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : user ? (
            <View style={{ gap: Spacing.lg }}>
              {/* Profile Card */}
              <Card>
                <CardContent style={styles.cardContent}>
                  <View style={styles.identity}>
                    {avatarUrl ? (
                      <Image source={avatarUrl} style={styles.avatar} contentFit="cover" transition={150} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.identityText}>
                      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {user.first_name} {user.last_name}
                      </Text>
                      {user.username ? (
                        <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>
                          @{user.username}
                        </Text>
                      ) : null}
                      <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  {/* Dashboard Panel */}
                  <View style={[styles.statsRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{user.posts_count}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        {t('profile.postsCount')}
                      </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{user.friends_count}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        {t('profile.friendsCount')}
                      </Text>
                    </View>
                  </View>

                  {/* Referral Code Card */}
                  {user.referral_code ? (
                    <ReferralLinkSection />
                  ) : null}
                </CardContent>
              </Card>

              {/* My Posts Section */}
              <View style={styles.postsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('profile.myPosts')}
                  </Text>
                  <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                    {t('profile.myPostsDesc')}
                  </Text>
                </View>

                {userPostsQuery.isLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.xl }} />
                ) : userPosts.length === 0 ? (
                  <View style={[styles.emptyPosts, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                    <Ionicons name="chatbox-ellipses-outline" size={32} color={colors.textSecondary} />
                    <Text style={[styles.emptyPostsText, { color: colors.textSecondary }]}>
                      No posts published yet
                    </Text>
                  </View>
                ) : (
                  <View style={styles.postsList}>
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPress={() => router.push(`/posts/${post.id}`)}
                      />
                    ))}
                  </View>
                )}
              </View>

            </View>
          ) : (
            <View style={styles.center}>
              <Text style={{ color: colors.textSecondary }}>Failed to load profile</Text>
            </View>
          )
        ) : (
          <Card>
            <CardContent>
              <View style={styles.guest}>
                <Text style={[styles.guestText, { color: colors.textSecondary }]}>
                  {t('profile.guestHint')}
                </Text>
                <Button onPress={() => router.replace('/login')}>
                  {t('common.signIn')}
                </Button>
              </View>
            </CardContent>
          </Card>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  cardContent: {
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
  },
  username: {
    fontSize: 13,
  },
  email: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  guest: {
    gap: Spacing.md,
  },
  guestText: {
    fontSize: 14,
  },
  postsSection: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    gap: 2,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyPosts: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyPostsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsList: {
    gap: Spacing.md,
  },
});