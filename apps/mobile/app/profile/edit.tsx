import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useProfile, useUpdateProfile } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';
import type { FormDataImage } from '@/lib/types';

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { t } = useI18n();

  const setUser = useAuthStore((s) => s.setUser);
  const profileQuery = useProfile();
  const user = profileQuery.data;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<FormDataImage | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setUsername(user.username);
    }
  }, [user]);

  const updateMutation = useUpdateProfile();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('createPost.chooseImages'));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage({
          uri: asset.uri,
          name: asset.fileName ?? `profile-${Date.now()}-${asset.uri.split('/').pop() ?? 'avatar.jpg'}`,
          type: asset.mimeType ?? 'image/jpeg',
        });
      }
    } catch {
      Alert.alert(t('common.genericError'));
    }
  };

  const handleSave = () => {
    if (!firstName.trim()) {
      Alert.alert(t('common.genericError'), t('validation.firstNameMin'));
      return;
    }
    if (!lastName.trim()) {
      Alert.alert(t('common.genericError'), t('validation.lastNameMin'));
      return;
    }
    if (!username.trim()) {
      Alert.alert(t('common.genericError'), t('validation.usernameMin'));
      return;
    }

    updateMutation.mutate(
      {
        first_name: firstName,
        last_name: lastName,
        username: username,
        profile_image: profileImage,
      },
      {
        onSuccess: (res) => {
          if (user) {
            setUser({
              ...user,
              first_name: res.first_name,
              last_name: res.last_name,
              username: res.username,
              profile_image: res.profile_image,
            });
          }
          Alert.alert(t('common.signIn'), t('editProfile.success'));
          router.back();
        },
        onError: (err) => {
          Alert.alert(t('common.genericError'), err.message || t('editProfile.failed'));
        },
      }
    );
  };

  const initials = user?.first_name ? user.first_name[0] : '';
  const currentAvatar = user?.profile_image ? resolveImageUrl(user.profile_image) : null;
  const previewUri = profileImage ? profileImage.uri : (currentAvatar ? currentAvatar : null);

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {t('editProfile.title')}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={[styles.root, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <CardContent>
              {/* Centered Photo Selector */}
              <View style={styles.avatarContainer}>
                <Pressable onPress={handlePickImage} style={styles.avatarWrapper} accessibilityRole="button">
                  {previewUri ? (
                    <Image source={previewUri} style={styles.avatarImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.avatarImage, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </Pressable>
                <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                  {t('editProfile.changePhoto')}
                </Text>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('editProfile.firstName')}
                  </Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.muted }]}
                    placeholder={t('editProfile.firstName')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('editProfile.lastName')}
                  </Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.muted }]}
                    placeholder={t('editProfile.lastName')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('editProfile.username')}
                  </Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.muted }]}
                    placeholder={t('editProfile.username')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            variant="default"
            onPress={handleSave}
            loading={updateMutation.isPending}
            style={styles.saveBtn}
          >
            {t('common.signIn')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: Spacing.md,
  },
  formGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  saveBtn: {
    height: 46,
    borderRadius: Radius.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
});
