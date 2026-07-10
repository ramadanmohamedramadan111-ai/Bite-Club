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
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LoginSchema, useLoginSchema } from './login-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { toast } from 'sonner';
import { useState } from 'react';
import VerifyForm from '../../../../components/auth/verify-form';
import useNavigation from '@/hooks/useNavigation';
import { setCookie } from 'cookies-next/client';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const loginSchema = useLoginSchema();

  const t = useTranslations('forms.login');

  const { navigate } = useNavigation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');
  const [step, setStep] = useState(1);

  const onSubmit = (data: LoginSchema) => {
    mutate(data);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: LoginSchema) => {
      console.log('Submitting login data:', data);
      return await clientFetch('/api/auth/login', 'POST', {
        body: data,
      });
    },
    onError: (error) => {
      toast.error(t('error'));
    },
    onSuccess: (data) => {
      if (data?.data.requiresVerification) {
        toast.info(t('verification'));
        setStep(2);
      } else {
        toast.success(t('success'));
        setCookie('accessToken', data?.data.token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        navigate('/');
      }
    },
  });

  if (step === 2) {
    return <VerifyForm email={email} purpose="login" />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t('fields.email.label')}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isPending}
                  {...register('email')}
                />
                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    {t('fields.password.label')}
                  </FieldLabel>
                  <Link
                    href="/forget-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    {t('forgotPasswordLink.text')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  disabled={isPending}
                  {...register('password')}
                />
                <FieldDescription className="text-destructive">
                  {errors.password?.message}
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>
                <FieldDescription className="text-center">
                  {t('registerLink.text')}{' '}
                  <Link href="/register">{t('registerLink.linkText')}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

