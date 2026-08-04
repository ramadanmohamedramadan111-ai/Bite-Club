import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';

export function FriendsSearch({ onSearch }: { onSearch: (term: string) => void }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearch(search.trim()), 500);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Ionicons name="search" size={16} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        value={search}
        onChangeText={setSearch}
        placeholder={t('common.search')}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {search.length > 0 && (
        <Ionicons
          name="close-circle"
          size={18}
          color={colors.textSecondary}
          onPress={() => setSearch('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
