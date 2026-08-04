import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { FormField } from '@/components/ui/form-field';
import { Input, type InputProps } from '@/components/ui/input';

type ControlledFieldProps<T extends FieldValues> = Omit<
  InputProps,
  'value' | 'onChange' | 'onChangeText' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  style?: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

export function ControlledField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  style,
  wrapperStyle,
  ...rest
}: ControlledFieldProps<T>) {
  return (
    <FormField label={label} error={error} style={wrapperStyle}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            {...rest}
            style={style}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!error}
          />
        )}
      />
    </FormField>
  );
}