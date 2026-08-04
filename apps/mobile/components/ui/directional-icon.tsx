import { Ionicons } from '@expo/vector-icons';
import { I18nManager } from 'react-native';

type DirectionalName =
  | 'arrow-back'
  | 'arrow-forward'
  | 'chevron-back'
  | 'chevron-forward'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'arrow-right';

type Props = {
  name: DirectionalName;
  size: number;
  color: string;
};

const rtlNames: Record<DirectionalName, DirectionalName> = {
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'chevron-left': 'chevron-right',
  'chevron-right': 'chevron-left',
  'arrow-left': 'arrow-right',
  'arrow-right': 'arrow-left',
};

export function DirectionalIcon({ name, size, color }: Props) {
  return <Ionicons name={I18nManager.isRTL ? rtlNames[name] : name} size={size} color={color} />;
}
