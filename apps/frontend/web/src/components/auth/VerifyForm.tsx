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
import NewPasswordForm from '@/components/auth/new-password-form';
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
                    <>
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
                      {errors.otp && (
                        <FieldDescription className="text-destructive">
                          {errors.otp.type === 'required'
                            ? t('fields.verificationCode.errors.required')
                            : t('fields.verificationCode.errors.invalid')}
                        </FieldDescription>
                      )}
                    </>
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

