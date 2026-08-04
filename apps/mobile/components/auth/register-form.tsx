import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ControlledField } from '@/components/ui/controlled-field';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FormField } from '@/components/ui/form-field';
import { Segmented } from '@/components/ui/segmented';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { mapServerFieldErrors } from '@/lib/map-server-errors';
import { createRegisterSchema, type RegisterValues } from '@/lib/schemas';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function RegisterForm({ referrerCode }: { referrerCode?: string }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string>();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      phone_number: '',
      gender: 'male',
      date_of_birth: '',
      password: '',
      password_confirmation: '',
      referrer_code: referrerCode ?? '',
    },
  });

  const gender = watch('gender');

  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) => api.post<{ data: unknown }>('/user/register', values),
    onSuccess: () => {
      router.replace('/login');
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        mapServerFieldErrors<RegisterValues>(e.data.errors, setError);
        setServerError(e.message);
      } else {
        setServerError(t('common.genericError'));
      }
    },
  });

  const onSubmit = (values: RegisterValues) => registerMutation.mutate(values);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('register.title')}</CardTitle>
        <CardDescription>{t('register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <View style={styles.twoCol}>
          <ControlledField
            control={control}
            name="first_name"
            label={t('common.firstName')}
            wrapperStyle={styles.col}
            placeholder={t('common.firstName')}
            error={errors.first_name?.message}
          />
          <ControlledField
            control={control}
            name="last_name"
            label={t('common.lastName')}
            wrapperStyle={styles.col}
            placeholder={t('common.lastName')}
            error={errors.last_name?.message}
          />
        </View>

        <ControlledField
          control={control}
          name="email"
          label={t('common.email')}
          placeholder={t('common.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email?.message}
        />

        <View style={styles.twoCol}>
          <ControlledField
            control={control}
            name="username"
            label={t('register.username')}
            wrapperStyle={styles.col}
            placeholder={t('register.username')}
            autoCapitalize="none"
            autoComplete="username"
            error={errors.username?.message}
          />
          <ControlledField
            control={control}
            name="phone_number"
            label={t('common.phone')}
            wrapperStyle={styles.col}
            placeholder="+20 123 456 789"
            keyboardType="phone-pad"
            error={errors.phone_number?.message}
          />
        </View>

        <FormField label={t('register.gender')} error={errors.gender?.message}>
          <Segmented
            options={[
              { value: 'male', label: t('register.male') },
              { value: 'female', label: t('register.female') },
            ]}
            value={gender}
            onChange={(value) => setValue('gender', value)}
          />
        </FormField>

        <ControlledField
          control={control}
          name="date_of_birth"
          label={t('register.dob')}
          placeholder="YYYY-MM-DD"
          error={errors.date_of_birth?.message}
        />

        <View style={styles.twoCol}>
          <ControlledField
            control={control}
            name="password"
            label={t('common.password')}
            wrapperStyle={styles.col}
            placeholder={t('common.passwordMinPlaceholder')}
            secureTextEntry
            error={errors.password?.message}
          />
          <ControlledField
            control={control}
            name="password_confirmation"
            label={t('common.confirmPassword')}
            wrapperStyle={styles.col}
            placeholder={t('common.passwordConfirmPlaceholder')}
            secureTextEntry
            error={errors.password_confirmation?.message}
          />
        </View>

        {referrerCode ? (
          <ControlledField
            control={control}
            name="referrer_code"
            label={t('register.referral')}
            editable={false}
            error={undefined}
          />
        ) : null}

        <ErrorBanner message={serverError} />

        <Button onPress={handleSubmit(onSubmit)} loading={registerMutation.isPending}>{t('register.submit')}
        </Button>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>
            {t('register.hasAccount')}{' '}
            <Link href="/login" style={{ color: colors.primary, fontWeight: '700' }}>
              {t('common.signIn')}
            </Link>
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
    width: 'auto',
  },
  footer: {
    alignItems: 'center',
  },
});