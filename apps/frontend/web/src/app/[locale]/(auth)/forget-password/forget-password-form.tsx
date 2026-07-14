'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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

import {
  ForgotPasswordSchema,
  useForgotPasswordSchema,
} from './forget-password-schema';
import VerifyForm from '@/components/auth/verify-form';
import { Link } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { forgotPasswordAction } from '@/actions/auth/forgot-password';

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
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(schema),
  });

  const email = watch('email');

  const { execute: sendOtp, isExecuting } = useAction(forgotPasswordAction, {
    onSuccess: () => {
      toast.success(t('success'));
      setStep(2);
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || t('error'));
    },
  });

  if (step === 2) {
    return <VerifyForm email={email} purpose="forgot-password" type="user" />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => sendOtp(data))}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t('fields.email.label')}
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  disabled={isExecuting}
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={isExecuting}>
                  {isExecuting
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

