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
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import NewPasswordForm from '@/components/auth/NewPasswordForm';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import {
  forgotPasswordAction,
  verifyEmailAction,
  verifyResetOtpAction,
  resendVerificationAction,
} from '@/actions/auth';

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
    formState: { isSubmitting, errors },
  } = useForm<VerifyFormValues>({
    defaultValues: {
      otp: '',
    },
  });

  const { execute: verifyResetOtp, isExecuting: isVerifyingReset } = useAction(
    verifyResetOtpAction,
    {
      onSuccess: () => {
        toast.success(t('reset'));
        setStep(2);
      },
      onError: ({ error }) => {
        const msg = error.serverError?.message || t('error');
        toast.error(msg);
        setErrorMessage(msg);
      },
    },
  );

  const { execute: verifyEmail, isExecuting: isVerifyingEmail } = useAction(
    verifyEmailAction,
    {
      onSuccess: () => {
        toast.success(t('success'));
        navigate('/login');
      },
      onError: ({ error }) => {
        const msg = error.serverError?.message || t('error');
        toast.error(msg);
        setErrorMessage(msg);
      },
    },
  );

  const onSubmit = (data: VerifyFormValues) => {
    setErrorMessage(null);
    if (purpose === 'forgot-password') {
      verifyResetOtp({ email, otp: data.otp });
    } else {
      verifyEmail({ email, otp: data.otp });
    }
  };

  const { execute: resendForgotPasswordOtp, isExecuting: isResendingForgot } =
    useAction(forgotPasswordAction, {
      onSuccess: () => {
        toast.success(t('resendSuccess'));
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || t('resendError'));
      },
    });

  const { execute: resendEmailVerification, isExecuting: isResendingEmail } =
    useAction(resendVerificationAction, {
      onSuccess: () => {
        toast.success(t('resendSuccess'));
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || t('resendError'));
      },
    });

  const handleResend = () => {
    if (purpose === 'forgot-password') {
      resendForgotPasswordOtp({ email });
    } else {
      resendEmailVerification({ email });
    }
  };

  const isPending = isVerifyingReset || isVerifyingEmail;
  const isResending = isResendingForgot || isResendingEmail;

  if (step === 2) {
    return <NewPasswordForm email={email} />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {purpose === 'forgot-password' ? t('title2') : t('title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle', { email })}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
              <Field className="space-y-2.5 flex flex-col items-center">
                <FieldLabel className="font-semibold text-sm text-foreground self-start">
                  {t('fields.verificationCode.label')}
                </FieldLabel>

                <Controller
                  name="otp"
                  control={control}
                  rules={{
                    required: true,
                    minLength: 6,
                  }}
                  render={({ field }) => (
                    <>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}>
                        <InputOTPGroup className="gap-1.5 sm:gap-2">
                          <InputOTPSlot index={0} className="rounded-xl border border-border" />
                          <InputOTPSlot index={1} className="rounded-xl border border-border" />
                          <InputOTPSlot index={2} className="rounded-xl border border-border" />
                          <InputOTPSlot index={3} className="rounded-xl border border-border" />
                          <InputOTPSlot index={4} className="rounded-xl border border-border" />
                          <InputOTPSlot index={5} className="rounded-xl border border-border" />
                        </InputOTPGroup>
                      </InputOTP>
                      {errors.otp && (
                        <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                          {errors.otp.type === 'required'
                            ? t('fields.verificationCode.errors.required')
                            : t('fields.verificationCode.errors.invalid')}
                        </FieldDescription>
                      )}
                    </>
                  )}
                />
              </Field>

              <Field className="space-y-3 pt-2">
                <Button type="submit" disabled={isSubmitting || isPending} className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer">
                  {isSubmitting || isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full text-xs font-bold text-primary hover:underline cursor-pointer">
                  {isResending
                    ? t('resendLink.loadingText')
                    : t('resendLink.linkText')}
                </Button>

                {errorMessage && (
                  <FieldDescription className="text-xs text-destructive font-semibold text-center mt-1">
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
