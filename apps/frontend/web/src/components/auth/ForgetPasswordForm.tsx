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

import VerifyForm from '@/components/auth/VerifyForm';
import { Link } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import {
  createForgotPasswordSchema,
  ForgotPasswordSchema,
} from '@/schemas/auth/forget-password-schema';
import { forgotPasswordAction } from '@/actions/auth';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const t = useTranslations('forms.forgetPassword');
  const schema = createForgotPasswordSchema(t);

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
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => sendOtp(data))}>
            <FieldGroup className="space-y-4">
              <Field className="space-y-2">
                <FieldLabel htmlFor="email" className="font-semibold text-sm text-foreground">
                  {t('fields.email.label')}
                </FieldLabel>

                <Input
                  id="email"
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

              <Field className="space-y-3.5 pt-2">
                <Button type="submit" disabled={isExecuting} className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer">
                  {isExecuting
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center text-xs text-muted-foreground">
                  {t('loginLink.text')}{' '}
                  <Link
                    href="/login"
                    className="font-bold text-primary hover:underline">
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
