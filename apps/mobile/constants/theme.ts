import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    foreground: '#1A1A1A',
    text: '#1A1A1A',
    textSecondary: '#71717A',
    muted: '#F4F4F5',
    mutedForeground: '#71717A',
    primary: '#D94F2A',
    primaryForeground: '#FFFFFF',
    gradientEnd: '#EA580C',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    success: '#16A34A',
    border: '#E4E4E7',
    input: '#E4E4E7',
    icon: '#71717A',
    tint: '#D94F2A',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#D94F2A',
  },
  dark: {
    background: '#111114',
    card: '#1C1C21',
    foreground: '#FAFAFA',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    muted: '#26262B',
    mutedForeground: '#A1A1AA',
    primary: '#E85C34',
    primaryForeground: '#FFFFFF',
    gradientEnd: '#F97316',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    success: '#22C55E',
    border: '#2A2A2F',
    input: '#2A2A2F',
    icon: '#A1A1AA',
    tint: '#E85C34',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#E85C34',
  },
} as const;

export type Theme = keyof typeof Colors.light;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
