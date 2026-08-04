import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { LocationPicker } from '@/components/location/location-picker';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useLocationStore } from '@/stores/location';

export function LocationButton() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { t } = useI18n();

  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="location" size={14} color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
          {location?.area ?? t('location.chooseLocation')}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>

      <LocationPicker
        visible={open}
        initial={location}
        onConfirm={setLocation}
        onReset={clearLocation}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 150,
    height: 34,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
  },
});
