import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useAIChatMutation, useAIChatAddToCartMutation, type AIChatMessage, type SmartWaiterSuggestion } from '@/lib/ai';

let chatId = 0;
const uid = () => `chat-${Date.now()}-${chatId++}`;

export default function AIChatScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { t, locale } = useI18n();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number>();
  const scrollRef = useRef<ScrollView>(null);

  const chatMutation = useAIChatMutation();
  const addToCartMutation = useAIChatAddToCartMutation();

  const greetings = useMemo(
    () => messages.length === 0,
    [messages.length],
  );

  const defaultLat = 30.0444;
  const defaultLng = 31.2357;

  const sendChat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.suggestion && m.suggestion.status === 'pending'
          ? { ...m, suggestion: { ...m.suggestion, status: 'declined' } }
          : m,
      ),
    );
    setMessages((prev) => [...prev, { id: uid(), sender: 'user', text: trimmed }]);
    setInput('');

    chatMutation.mutate(
      {
        message: trimmed,
        conversation_id: conversationId,
        latitude: defaultLat,
        longitude: defaultLng,
        locale: (locale === 'ar' || locale === 'en' ? locale : 'en') as 'ar' | 'en',
      },
      {
        onSuccess: (res) => {
          const data = res.data;
          if (!data) return;
          if (data.conversation_id) setConversationId(data.conversation_id);
          const items = (data.items ?? []).map((item) => ({
            id: Number(item.id),
            name: String(item.name ?? ''),
            price: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            why: String(item.why ?? ''),
          }));
          const suggestion: SmartWaiterSuggestion | undefined =
            items.length > 0
              ? {
                  restaurant_id: Number(data.recommended_restaurant_id ?? 0),
                  restaurant_name: String(data.restaurant_name ?? ''),
                  items,
                  total_price: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                  status: 'pending',
                }
              : undefined;
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              sender: 'ai',
              text: data.reply,
              suggestion,
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => [...prev, { id: uid(), sender: 'ai', text: t('ai.serverError') }]);
        },
      },
    );
  };

  const acceptSuggestion = (msgId: string, suggestion: SmartWaiterSuggestion) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.suggestion
          ? { ...m, suggestion: { ...m.suggestion, status: 'accepted' } }
          : m,
      ),
    );
    addToCartMutation.mutate({
      restaurant_id: suggestion.restaurant_id,
      items: suggestion.items.map((item) => ({ id: item.id, quantity: item.quantity })),
    });
  };

  const declineSuggestion = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.suggestion
          ? { ...m, suggestion: { ...m.suggestion, status: 'declined' } }
          : m,
      ),
    );
  };

  const newChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setInput('');
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.headerIdentity}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>{t('ai.title')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('ai.subtitle')}</Text>
            </View>
          </View>

          <Pressable onPress={newChat} hitSlop={10} accessibilityRole="button" style={styles.headerIcon}>
            <Ionicons name="refresh" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}>
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <View key={msg.id} style={styles.msgGroup}>
                <View style={[styles.row, isAi ? styles.rowAi : styles.rowUser]}>
                  {isAi && (
                    <View style={[styles.miniAvatar, { backgroundColor: colors.primary }]}>
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isAi
                        ? [styles.bubbleAi, { backgroundColor: colors.muted, borderColor: colors.border }]
                        : [styles.bubbleUser, { backgroundColor: colors.primary }],
                    ]}>
                    <Text style={isAi ? { color: colors.text } : { color: colors.primaryForeground }}>
                      {msg.text}
                    </Text>
                  </View>
                </View>

                {msg.suggestion && (
                  <View style={[styles.sugWrap, isAi ? styles.sugWrapAi : null]}>
                    <View style={[styles.suggestion, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.sugRestaurant, { color: colors.primary }]} numberOfLines={1}>
                        {msg.suggestion.restaurant_name}
                      </Text>
                      {msg.suggestion.items.map((item) => (
                        <View key={item.id} style={[styles.sugItem, { borderBottomColor: colors.border }]}>
                          <View style={[styles.sugItemIcon, { backgroundColor: colors.muted }]}>
                            <Ionicons name="restaurant-outline" size={16} color={colors.textSecondary} />
                          </View>
                          <View style={styles.sugItemBody}>
                            <Text style={[styles.sugItemName, { color: colors.text }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={[styles.sugItemMeta, { color: colors.textSecondary }]}>
                              {item.quantity}x @ {item.price.toFixed(2)}
                            </Text>
                            <Text style={[styles.sugItemWhy, { color: colors.textSecondary }]} numberOfLines={2}>
                              {item.why}
                            </Text>
                          </View>
                        </View>
                      ))}

                      <View style={[styles.sugTotal, { borderTopColor: colors.border }]}>
                        <Text style={[styles.sugTotalLabel, { color: colors.textSecondary }]}>{t('ai.total')}</Text>
                        <Text style={[styles.sugTotalValue, { color: colors.text }]}>
                          {msg.suggestion.total_price.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.sugActions}>
                        {msg.suggestion.status === 'pending' ? (
                          <View style={styles.sugButtons}>
                            <Pressable
                              onPress={() => declineSuggestion(msg.id)}
                              style={[styles.sugButton, { backgroundColor: colors.destructive }]}>
                              <Text style={styles.sugButtonText}>{t('ai.decline')}</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => acceptSuggestion(msg.id, msg.suggestion!)}
                              style={[styles.sugButton, { backgroundColor: colors.success }]}>
                              <Ionicons name="add" size={16} color="#FFFFFF" />
                              <Text style={styles.sugButtonText}>{t('ai.accept')}</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <View style={styles.sugStatus}>
                            {msg.suggestion.status === 'accepted' ? (
                              <View style={styles.sugStatusOk}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Text style={{ color: colors.success }}>{t('ai.added')}</Text>
                              </View>
                            ) : (
                              <Text style={{ color: colors.textSecondary }}>{t('ai.declined')}</Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {greetings && !chatMutation.isPending && messages.length === 0 && (
            <View style={[styles.row, styles.rowAi]}>
              <View style={[styles.miniAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.bubbleAi, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={{ color: colors.text }}>{t('ai.welcome')}</Text>
              </View>
            </View>
          )}

          {chatMutation.isPending && (
            <View style={[styles.row, styles.rowAi]}>
              <View style={[styles.miniAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.bubbleAi, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder={t('ai.placeholder')}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={() => sendChat(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => sendChat(input)}
            disabled={!input.trim() || chatMutation.isPending}
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.primary,
                opacity: input.trim() && !chatMutation.isPending ? 1 : 0.4,
              },
            ]}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  headerIcon: {
    padding: Spacing.xs,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerText: {
    gap: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
  },
  messages: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  msgGroup: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  rowAi: {
    justifyContent: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleAi: {
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    borderTopRightRadius: 4,
  },
  sugWrap: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  sugWrapAi: {
    marginLeft: 32,
  },
  suggestion: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sugRestaurant: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sugItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sugItemIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sugItemBody: {
    flex: 1,
    gap: 1,
  },
  sugItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  sugItemMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  sugItemWhy: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sugTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sugTotalLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sugTotalValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  sugActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
  },
  sugButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sugButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
    borderRadius: Radius.md,
  },
  sugButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sugStatus: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sugStatusOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});