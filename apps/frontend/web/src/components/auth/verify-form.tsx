'use client';

import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import NewPasswordForm from '@/app/[locale]/(auth)/forget-password/new-password-form';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { verifyResetOtpAction } from '@/actions/auth/verify-reset-otp';
import { forgotPasswordAction } from '@/actions/auth/forgot-password';

type VerifyFormValues = {
  otp: string;
};

type VerifyFormProps = React.ComponentProps<'div'> & {
  email: string;
  purpose: 'login' | 'forgot-password';
  type: 'user' | 'restaurant';
};

export default function VerifyForm({
  className,
  email,
  purpose,
  ...props
}: VerifyFormProps) {
  const t = useTranslations('forms.verify');

  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function navigate(path: string) {
    if (pathname === path) {
      router.refresh();
    } else {
      router.push(path);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyFormValues>({
    defaultValues: {
      otp: '',
    },
  });

  const { execute: verifyResetOtp, isExecuting: isVerifyingReset } = useAction(verifyResetOtpAction, {
    onSuccess: () => {
      toast.success(t('reset'));
      setStep(2);
    },
    onError: ({ error }) => {
      const msg = error.serverError?.message || t('error');
      toast.error(msg);
      setErrorMessage(msg);
    },
  });

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: async (data: VerifyFormValues) => {
      return clientFetch('/api/auth/verify-email', 'POST', {
        body: {
          email,
          otp: data.otp,
        },
      });
    },
    onSuccess: () => {
      toast.success(t('success'));
      navigate('/login');
    },
    onError: (err: unknown) => {
      const msg = (err as Error)?.message || t('error');
      toast.error(msg);
      setErrorMessage(msg);
    },
  });

  const onSubmit = (data: VerifyFormValues) => {
    setErrorMessage(null);
    if (purpose === 'forgot-password') {
      verifyResetOtp({ email, otp: data.otp });
    } else {
      verifyEmail(data);
    }
  };

  const { execute: resendForgotPasswordOtp, isExecuting: isResendingForgot } = useAction(forgotPasswordAction, {
    onSuccess: () => {
      toast.success(t('resendSuccess'));
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || t('resendError'));
    },
  });

  const { mutate: resendEmailVerification, isPending: isResendingEmail } = useMutation({
    mutationFn: async () => {
      return clientFetch('/api/auth/resend-verification', 'POST', {
        body: { email },
      });
    },
    onSuccess: () => {
      toast.success(t('resendSuccess'));
    },
    onError: () => {
      toast.error(t('resendError'));
    },
  });

  const handleResend = () => {
    if (purpose === 'forgot-password') {
      resendForgotPasswordOtp({ email });
    } else {
      resendEmailVerification();
    }
  };

  const isPending = isVerifyingReset || isVerifyingEmail;
  const isResending = isResendingForgot || isResendingEmail;

  if (step === 2) {
    return <NewPasswordForm email={email} />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {purpose === 'forgot-password' ? t('title2') : t('title')}
          </CardTitle>
          <CardDescription>{t('subtitle', { email })}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('fields.verificationCode.label')}</FieldLabel>

                <Controller
                  name="otp"
                  control={control}
                  rules={{
                    required: true,
                    minLength: 6,
                  }}
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting || isPending}>
                  {isSubmitting || isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}>
                  {isResending
                    ? t('resendLink.loadingText')
                    : t('resendLink.linkText')}
                </Button>

                {errorMessage && (
                  <FieldDescription className="text-destructive">
                    {errorMessage}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

