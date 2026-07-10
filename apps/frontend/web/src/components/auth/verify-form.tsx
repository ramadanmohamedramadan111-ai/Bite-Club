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

type VerifyFormValues = {
  otp: string;
};

type VerifyFormProps = React.ComponentProps<'div'> & {
  email: string;
  purpose: 'login' | 'forgot-password';
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

  const onSubmit = (data: VerifyFormValues) => {
    mutate(data);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: VerifyFormValues) => {
      const response = await clientFetch(
        purpose === 'forgot-password'
          ? '/api/auth/verify-otp'
          : '/api/auth/verify-email',
        'POST',
        {
          body: {
            email,
            otp: data.otp,
          },
        },
      );

      return response;
    },
    onSuccess: (data) => {
      if (purpose === 'login') {
        toast.success(t('success'));
        navigate('/login');
      } else {
        toast.success(t('reset'));
        setStep(2);
      }
    },
    onError: (error) => {
      toast.error(t('error'));
    },
  });

  const { mutate: resendOTP, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const response = await clientFetch(
        purpose === 'forgot-password'
          ? '/api/auth/send-otp'
          : '/api/auth/resend-verification',
        'POST',
        {
          body: {
            email,
          },
        },
      );

      return response;
    },
    onSuccess: (data) => {
      toast.success(t('resendSuccess'));
    },
    onError: (error) => {
      toast.error(t('resendError'));
    },
  });

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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => resendOTP()}
                  disabled={isResending}>
                  {isResending
                    ? t('resendLink.loadingText')
                    : t('resendLink.linkText')}
                </Button>

                <FieldDescription className="text-destructive">
                  {error?.message}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

