import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type InputProps = TextInputProps & {
  error?: boolean;
  label?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { style, error, secureTextEntry, ...rest },
  ref,
) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const [secure, setSecure] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={ref}
        {...rest}
        secureTextEntry={secure}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: scheme === 'dark' ? colors.muted : colors.background,
            borderColor: error ? colors.destructive : colors.border,
          },
          style,
        ]}
      />
      {secureTextEntry && (
        <Pressable
          onPress={() => setSecure((s) => !s)}
          hitSlop={12}
          style={styles.eye}
          accessibilityRole="button">
          <Ionicons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.mutedForeground}
          />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  input: {
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  eye: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
