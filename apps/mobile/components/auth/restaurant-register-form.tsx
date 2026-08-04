import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { ControlledField } from '@/components/ui/controlled-field';
import { FormField } from '@/components/ui/form-field';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { mapServerFieldErrors } from '@/lib/map-server-errors';
import { useRestaurantCategories } from '@/lib/queries';
import { createRestaurantRegisterSchema, type RestaurantRegisterValues } from '@/lib/schemas';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function RestaurantRegisterForm() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { data: categories = [], isLoading: loadingCategories } = useRestaurantCategories();

  const { t } = useI18n();
  const [serverError, setServerError] = useState<string>();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RestaurantRegisterValues>({
    resolver: zodResolver(createRestaurantRegisterSchema(t)),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      category_id: undefined as unknown as number,
      description: '',
      address: '',
      password: '',
      password_confirmation: '',
    },
  });

  const selectedCategoryId = watch('category_id');

  const registerMutation = useMutation({
    mutationFn: (values: RestaurantRegisterValues) =>
      api.post<{ data: unknown }>('/restaurant/register', values),
    onSuccess: () => {
      router.replace('/login');
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        mapServerFieldErrors<RestaurantRegisterValues>(e.data.errors, setError);
        setServerError(e.message);
      } else {
        setServerError(t('common.genericError'));
      }
    },
  });

  const onSubmit = (values: RestaurantRegisterValues) => registerMutation.mutate(values);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('restaurant.title')}</CardTitle>
        <CardDescription>{t('restaurant.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ControlledField
          control={control}
          name="name"
          label={t('restaurant.name')}
          placeholder={t('restaurant.name')}
          error={errors.name?.message}
        />

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

        <ControlledField
          control={control}
          name="phone_number"
          label={t('common.phone')}
          placeholder="+20 123 456 789"
          keyboardType="phone-pad"
          error={errors.phone_number?.message}
        />

        <FormField label={t('restaurant.category')} error={errors.category_id?.message}>
          {loadingCategories ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.chips}>
              {categories.map((category) => {
                const selected = selectedCategoryId === category.id;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setValue('category_id', category.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? colors.primary : colors.muted,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.chipLabel,
                        { color: selected ? colors.primaryForeground : colors.textSecondary },
                      ]}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </FormField>

        <ControlledField
          control={control}
          name="description"
          label={t('restaurant.description')}
          placeholder={t('restaurant.description')}
          multiline
          numberOfLines={4}
          style={styles.multiline}
          error={errors.description?.message}
        />

        <ControlledField
          control={control}
          name="address"
          label={t('restaurant.address')}
          placeholder={t('restaurant.address')}
          error={errors.address?.message}
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

        <ErrorBanner message={serverError} />

        <Button onPress={handleSubmit(onSubmit)} loading={registerMutation.isPending}>{t('restaurant.submit')}
        </Button>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>
            {t('restaurant.alreadyRegistered')}{' '}
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  multiline: {
    height: 96,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  footer: {
    alignItems: 'center',
  },
});