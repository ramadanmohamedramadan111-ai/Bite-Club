import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ControlledField } from '@/components/ui/controlled-field';
import { ErrorBanner } from '@/components/ui/error-banner';
import { OtpInput } from '@/components/ui/otp-input';
import { api, ApiError } from '@/lib/api';
import {
  createForgotPasswordSchema,
  createResetPasswordSchema,
  createVerifyOtpSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
  type VerifyOtpValues,
} from '@/lib/schemas';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';

type Step = 1 | 2 | 3;

export function ForgetPasswordForm() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string>();
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string>();

  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(createResetPasswordSchema(t)),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      api.post('/user/forgot-password', { email: values.email }),
    onSuccess: (_res, values) => {
      setEmail(values.email);
      setStep(2);
    },
    onError: (e) => {
      setServerError(e instanceof ApiError ? e.message : t('common.genericError'));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => api.post('/user/forgot-password', { email }),
    onError: (e) => {
      setServerError(e instanceof ApiError ? e.message : t('common.genericError'));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (values: VerifyOtpValues) => api.post('/user/verify-reset-otp', { email, otp: values.otp }),
    onSuccess: () => {
      setStep(3);
    },
    onError: (e) => {
      setOtpError(e instanceof ApiError ? e.message : t('common.genericError'));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      api.post('/user/reset-password', { email, ...values }),
    onSuccess: () => {
      router.replace('/login');
    },
    onError: (e) => {
      setServerError(e instanceof ApiError ? e.message : t('common.genericError'));
    },
  });

  const sendOtp = (values: ForgotPasswordValues) => sendOtpMutation.mutate(values);

  const resendOtp = () => resendOtpMutation.mutate();

  const verifyOtp = (values: VerifyOtpValues) => verifyOtpMutation.mutate(values);

  const handleVerifyOtp = async () => {
    const parsed = createVerifyOtpSchema(t).safeParse({ otp });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? t('fp.otpInvalid'));
      return;
    }
    await verifyOtp(parsed.data);
  };

  const resetPassword = (values: ResetPasswordValues) => resetPasswordMutation.mutate(values);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step === 1 && t('fp.title1')}
          {step === 2 && t('fp.title2')}
          {step === 3 && t('fp.title3')}
        </CardTitle>
        <CardDescription>
          {step === 1 && t('fp.subtitle1')}
          {step === 2 && t('fp.subtitle2', { email })}
          {step === 3 && t('fp.subtitle3')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <>
            <ControlledField
              control={emailForm.control}
              name="email"
              label={t('common.email')}
              placeholder={t('common.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailForm.formState.errors.email?.message}
            />
            <ErrorBanner message={serverError} />
            <Button
              onPress={emailForm.handleSubmit(sendOtp)}
              loading={sendOtpMutation.isPending}>
              {t('fp.sendCode')}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <OtpInput value={otp} onChange={setOtp} error={!!otpError} />
            <ErrorBanner message={otpError} />
            <View style={styles.otpActions}>
              <Text style={{ color: colors.textSecondary }}>{t('fp.didntReceive')}</Text>
              <Pressable onPress={resendOtp} disabled={resendOtpMutation.isPending}>
                <Text style={[styles.resend, { color: colors.primary }]}>
                  {resendOtpMutation.isPending ? t('fp.sending') : t('fp.resend')}
                </Text>
              </Pressable>
            </View>
            <Button onPress={handleVerifyOtp} loading={verifyOtpMutation.isPending}>
              {t('fp.verify')}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <ControlledField
              control={passwordForm.control}
              name="password"
              label={t('fp.newPassword')}
              placeholder={t('common.passwordMinPlaceholder')}
              secureTextEntry
              error={passwordForm.formState.errors.password?.message}
            />
            <ControlledField
              control={passwordForm.control}
              name="password_confirmation"
              label={t('common.confirmPassword')}
              placeholder={t('common.passwordConfirmPlaceholder')}
              secureTextEntry
              error={passwordForm.formState.errors.password_confirmation?.message}
            />
            <ErrorBanner message={serverError} />
            <Button
              onPress={passwordForm.handleSubmit(resetPassword)}
              loading={resetPasswordMutation.isPending}>
              {t('fp.reset')}
            </Button>
          </>
        )}

        <View style={styles.footer}>
          <Link href="/login" style={{ color: colors.textSecondary }}>
            <Text style={{ color: colors.textSecondary }}>
              {t('fp.back')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('fp.signIn')}</Text>
            </Text>
          </Link>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  resend: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
});