import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
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
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { mapServerFieldErrors } from '@/lib/map-server-errors';
import { createLoginSchema, type LoginValues } from '@/lib/schemas';
import { useAuthStore, type AuthUser } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function LoginForm() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      api.post<{ data: { access_token: string; user: AuthUser } }>('/user/login', values),
    onSuccess: async (res) => {
      if (res.data?.access_token) {
        setAuth(res.data.access_token, res.data.user);

        const guestCart = useCartStore.getState().cart;
        if (guestCart && guestCart.items.length > 0) {
          try {
            await api.post('/user/cart/merge', {
              restaurant_id: guestCart.restaurant.id,
              items: guestCart.items.map((item) => ({
                item_id: item.item_id,
                quantity: item.quantity,
                notes: item.notes || null,
              })),
            });
            useCartStore.getState().clearCart();
          } catch (err) {
            console.error('Failed to merge guest cart:', err);
          }
        }

        if (redirect) {
          router.replace(redirect as any);
        } else {
          router.replace('/');
        }
      }
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        mapServerFieldErrors<LoginValues>(e.data.errors, setError);
        setServerError(e.message);
      } else {
        setServerError(t('common.genericError'));
      }
    },
  });

  const onSubmit = (values: LoginValues) => loginMutation.mutate(values);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
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
          name="password"
          label={t('common.password')}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
          error={errors.password?.message}
        />

        <Link href="/forget-password" style={[styles.forgot, { color: colors.primary }]}>
          {t('login.forgot')}
        </Link>

        <ErrorBanner message={serverError} />

        <Button onPress={handleSubmit(onSubmit)} loading={loginMutation.isPending}>
          {t('common.signIn')}
        </Button>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('login.or')}</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Button variant="outline" onPress={() => router.replace('/')}>
          {t('login.guest')}
        </Button>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>
            {t('login.noAccount')}{' '}
            <Link href="/register" style={{ color: colors.primary, fontWeight: '700' }}>
              {t('common.createAccount')}
            </Link>
          </Text>
          <Link href="/restaurant-register" style={[styles.footerLink, { color: colors.primary }]}>
            {t('login.ownRestaurant')}
          </Link>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -Spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
  },
  footer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});