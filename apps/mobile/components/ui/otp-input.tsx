import { forwardRef, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SLOTS = 6;

export const OtpInput = forwardRef<TextInput, { value: string; onChange: (v: string) => void; error?: boolean }>(
  function OtpInput({ value, onChange, error }, ref) {
    const scheme = useColorScheme();
    const colors = Colors[scheme ?? 'light'];
    const inputRef = useRef<TextInput | null>(null);

    const digits = Array.from({ length: SLOTS }, (_, i) => value[i] ?? '');

    return (
      <View>
        <Pressable style={styles.grid} onPress={() => inputRef.current?.focus()}>
          {digits.map((digit, i) => {
            const isActive = i === value.length;
            return (
              <View
                key={i}
                style={[
                  styles.slot,
                  {
                    backgroundColor: scheme === 'dark' ? colors.muted : colors.background,
                    borderColor: error
                      ? colors.destructive
                      : isActive
                        ? colors.primary
                        : colors.border,
                  },
                  isActive && styles.slotActive,
                ]}>
                <Text style={[styles.digit, { color: colors.text }]}>{digit}</Text>
              </View>
            );
          })}
        </Pressable>
        <TextInput
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          value={value}
          onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, SLOTS))}
          keyboardType="number-pad"
          maxLength={SLOTS}
          style={styles.hidden}
          accessibilityLabel="Verification code"
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  slot: {
    flex: 1,
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 52,
  },
  slotActive: {
    shadowColor: '#D94F2A',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
});