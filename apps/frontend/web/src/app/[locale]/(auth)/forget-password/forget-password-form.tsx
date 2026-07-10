'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { clientFetch } from '@/utils/client-fetch';
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

import {
  ForgotPasswordSchema,
  useForgotPasswordSchema,
} from './forget-password-schema';
import VerifyForm from '@/components/auth/verify-form';
import { Link } from '@/i18n/navigation';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const t = useTranslations('forms.forgetPassword');
  const schema = useForgotPasswordSchema();

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(schema),
  });

  const email = watch('email');

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordSchema) =>
      clientFetch('/api/auth/send-otp', 'POST', {
        body: data,
      }),

    onSuccess: () => {
      toast.success(t('success'));
      setStep(2);
    },

    onError: (error) => {
      toast.error(t('error'));
    },
  });

  if (step === 2) {
    return <VerifyForm email={email} purpose="forgot-password" />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t('fields.email.label')}
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  disabled={isPending}
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center">
                  {t('loginLink.text')}{' '}
                  <Link
                    href="/login"
                    className="text-sm font-medium underline-offset-4 hover:underline">
                    {t('loginLink.linkText')}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

