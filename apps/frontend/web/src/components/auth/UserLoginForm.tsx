'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import useNavigation from '@/hooks/useNavigation';

import { useAction } from 'next-safe-action/hooks';

import { mapServerFieldErrors } from '@/utils/map-server-field-errors';

import {
  createLoginSchema,
  type LoginSchema,
} from '@/schemas/auth/restaurant-login-schema';

import { toast } from 'sonner';
import { loginUserAction } from '@/actions/auth';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cart';

export default function UserLoginForm({
  className,
}: React.ComponentProps<'div'>) {
  const t = useTranslations('forms.login');
  const loginSchema = createLoginSchema(t);

  const { navigate } = useNavigation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const searchParams = useSearchParams();

  const { execute: loginUser, isExecuting } = useAction(loginUserAction, {
    onSuccess: async ({ data }) => {
      toast.success(data?.message || t('success'));

      let redirect = searchParams.get('redirect') || '/';
      redirect = redirect.replace(/^\/(en|ar)(\/|$)/, '/');

      useCartStore.getState().clearCart();

      navigate(redirect);
    },

    onError: ({ error }) => {
      if (error.serverError?.data?.errors) {
        mapServerFieldErrors(error.serverError.data.errors, setError);
      }

      toast.error(error.serverError?.message || t('error'));
    },
  });

const onSubmit = (data: LoginSchema) => {
  const guestCart = useCartStore.getState().cart;

  const guestCartPayload =
    guestCart && guestCart.items.length > 0
      ? {
          restaurant_id: guestCart.restaurant.id,
          items: guestCart.items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        }
      : undefined;

  loginUser({ ...data, guestCart: guestCartPayload });
};

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
              <Field className="space-y-2">
                <FieldLabel className="font-bold text-xs text-foreground uppercase tracking-wider">{t('fields.email.label')}</FieldLabel>
                <Input
                  type="email"
                  disabled={isExecuting}
                  {...register('email')}
                  className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                />
                {errors.email?.message && (
                  <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                    {errors.email?.message}
                  </FieldDescription>
                )}
              </Field>

              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel className="font-bold text-xs text-foreground uppercase tracking-wider">{t('fields.password.label')}</FieldLabel>
                  <Link
                    href="/forget-password"
                    className="text-xs font-bold text-primary hover:underline">
                    {t('forgotPasswordLink.text')}
                  </Link>
                </div>
                <Input
                  type="password"
                  disabled={isExecuting}
                  {...register('password')}
                  className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                />
                {errors.password?.message && (
                  <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                    {errors.password?.message}
                  </FieldDescription>
                )}
              </Field>

              <Field className="space-y-3.5 pt-2">
                <Button type="submit" disabled={isExecuting} className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer">
                  {isExecuting
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center text-xs text-muted-foreground">
                  {t('registerLink.text')}{' '}
                  <Link
                    href="/register"
                    className="font-bold text-primary hover:underline">
                    {t('registerLink.linkText')}
                  </Link>
                </FieldDescription>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl h-10 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={isExecuting}
                  onClick={() => navigate('/')}>
                  {t('guestLoginButton.text')}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
