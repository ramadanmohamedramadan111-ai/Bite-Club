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
import { loginUserAction } from '@/actions/auth/login';

import { mapServerFieldErrors } from '@/utils/server/map-server-field-errors';

import {
  createLoginSchema,
  type LoginSchema,
} from '@/schemas/auth/restaurant-login-schema';

import { toast } from 'sonner';

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

  const { execute: loginUser, isExecuting } = useAction(loginUserAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || t('success'));
      navigate('/');
    },

    onError: ({ error }) => {
      if (error.serverError?.data?.errors) {
        mapServerFieldErrors(error.serverError.data.errors, setError);
      }

      toast.error(error.serverError?.message || t('error'));
    },
  });

  const onSubmit = (data: LoginSchema) => {
    loginUser(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>

          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('fields.email.label')}</FieldLabel>

                <Input
                  type="email"
                  disabled={isExecuting}
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.password.label')}</FieldLabel>

                <Input
                  type="password"
                  disabled={isExecuting}
                  {...register('password')}
                />

                <FieldDescription className="text-destructive">
                  {errors.password?.message}
                </FieldDescription>

                <div className="text-right">
                  <Link
                    href="/forget-password"
                    className="text-sm text-primary hover:underline">
                    {t('forgotPasswordLink.text')}
                  </Link>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isExecuting} className="w-full">
                  {isExecuting
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center">
                  {t('registerLink.text')}{' '}
                  <Link
                    href="/register"
                    className="text-primary hover:underline">
                    {t('registerLink.linkText')}
                  </Link>
                </FieldDescription>

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 w-full"
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
