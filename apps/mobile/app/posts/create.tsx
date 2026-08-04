import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useCreatePost, useShareableOrders } from '@/lib/queries';
import type { FormDataImage } from '@/lib/types';

const MAX_CAPTION = 280;
const MAX_IMAGES = 10;

export default function CreatePostScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<FormDataImage[]>([]);
  const [picking, setPicking] = useState(false);

  const ordersQuery = useShareableOrders();
  const createMutation = useCreatePost();

  const orders = ordersQuery.data ?? [];

  async function pickImages() {
    if (picking) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('createPost.chooseImages'));
      return;
    }
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - images.length,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const picked: FormDataImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName ?? `image-${Date.now()}-${asset.uri.split('/').pop() ?? 'photo.jpg'}`,
          type: asset.mimeType ?? 'image/jpeg',
        }));
        setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
      }
    } catch {
      Alert.alert(t('common.genericError'));
    } finally {
      setPicking(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function onShare() {
    if (!selectedOrderId || caption.trim().length === 0 || images.length === 0) {
      Alert.alert(t('createPost.requiredFields'));
      return;
    }
    createMutation.mutate(
      { order_id: selectedOrderId, caption: caption.trim(), images },
      {
        onSuccess: () => {
          Alert.alert(t('createPost.success'));
          router.back();
        },
        onError: () => Alert.alert(t('createPost.failed')),
      },
    );
  }

  const remaining = MAX_CAPTION - caption.length;
  const canShare = selectedOrderId !== null && images.length > 0 && caption.trim().length > 0 && !createMutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.back}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t('createPost.title')}
        </Text>
        <Pressable
          onPress={onShare}
          disabled={!canShare}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.shareBtn,
            { backgroundColor: canShare ? colors.primary : colors.border },
            pressed && canShare && { opacity: 0.85 },
          ]}>
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.shareText, { color: colors.primaryForeground }]}>{t('createPost.share')}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('createPost.selectOrder')}</Text>
          {ordersQuery.isLoading ? (
            <View style={[styles.orderCard, { borderColor: colors.border }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : orders.length === 0 ? (
            <View style={[styles.orderCard, { borderColor: colors.border }]}>
              <Text style={[styles.noOrders, { color: colors.textSecondary }]}>{t('createPost.noOrders')}</Text>
            </View>
          ) : (
            <View style={styles.orderList}>
              {orders.map((order) => {
                const selected = order.id === selectedOrderId;
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => setSelectedOrderId(selected ? null : order.id)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.orderCard,
                      { borderColor: selected ? colors.primary : colors.border },
                      pressed && { opacity: 0.8 },
                    ]}>
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderName, { color: colors.text }]} numberOfLines={1}>
                        {order.restaurant.name}
                      </Text>
                      <Text style={[styles.orderMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                        {order.items.map((item) => `${item.quantity}x ${item.item_name}`).join(', ')}
                      </Text>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('createPost.postImages')}</Text>
          {images.length === 0 ? (
            <Pressable
              onPress={pickImages}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.imagePicker,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}>
              <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.imagePickerText, { color: colors.text }]}>{t('createPost.addImages')}</Text>
              <Text style={[styles.imagePickerHint, { color: colors.textSecondary }]}>
                {t('createPost.selectMultiple')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.previewGrid}>
              {images.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.previewWrap}>
                  <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" transition={150} />
                  <Pressable
                    onPress={() => removeImage(index)}
                    hitSlop={8}
                    accessibilityRole="button"
                    style={styles.removeBtn}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <Pressable
                  onPress={pickImages}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.addMore,
                    { borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}>
                  {picking ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="add" size={24} color={colors.primary} />
                  )}
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('createPost.caption')}</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t('createPost.captionPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={MAX_CAPTION}
            textAlignVertical="top"
            style={[
              styles.captionInput,
              { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border },
            ]}
          />
          <Text style={[styles.charCount, { color: remaining < 0 ? colors.destructive : colors.textSecondary }]}>
            {t('createPost.charCount', { count: String(remaining) })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  back: { padding: Spacing.xs },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  shareBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 64,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderName: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderMeta: {
    fontSize: 12,
  },
  noOrders: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  orderList: {
    gap: Spacing.sm,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: Spacing['3xl'],
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  imagePickerHint: {
    fontSize: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  previewWrap: {
    position: 'relative',
  },
  preview: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMore: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionInput: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 120,
    fontSize: 14,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});
