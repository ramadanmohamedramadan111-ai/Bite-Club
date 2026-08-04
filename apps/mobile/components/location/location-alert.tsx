import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { LocationPicker } from '@/components/location/location-picker';
import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useLocationStore } from '@/stores/location';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function LocationAlert({ style }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);

  const [open, setOpen] = useState(false);

  if (location) return null;

  return (
    <>
      <View style={[styles.card, { backgroundColor: '#FF980010', borderColor: '#FF98004D' }, style]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: '#FF980020' }]}>
              <Ionicons name="location" size={20} color="#FF9800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('location.requiredTitle')}
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {t('location.requiredMessage')}
              </Text>
            </View>
          </View>

          <Button
            variant="default"
            onPress={() => setOpen(true)}
            style={styles.button}
          >
            <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('location.chooseLocationButton')}</Text>
          </Button>
        </View>
      </View>

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
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
