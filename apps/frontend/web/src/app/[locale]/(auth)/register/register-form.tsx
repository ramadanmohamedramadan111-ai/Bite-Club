'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Link } from '@/i18n/navigation';
import { type RegisterSchema, useRegisterSchema } from './register-schema';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { toast } from 'sonner';
import { useState } from 'react';
import VerifyForm from '@/components/auth/verify-form';
import useNavigation from '@/hooks/useNavigation';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const registerSchema = useRegisterSchema();

  const t = useTranslations('forms.register');

  const [step, setStep] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: undefined,
    },
  });

  const email = watch('email');

  const onSubmit = (data: RegisterSchema) => {
    mutate(data);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: RegisterSchema) => {
      console.log('Submitting registration data:', data);
      const response = await clientFetch('/api/auth/signup', 'POST', {
        body: data,
      });
    },
    onError: (error) => {
      toast.error(t('error'));
    },
    onSuccess: (data) => {
      toast.success(t('success'));
    },
  });

  const { navigate } = useNavigation();

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
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first-name">
                    {t('fields.firstName.label')}
                  </FieldLabel>

                  <Input
                    id="first-name"
                    disabled={isPending}
                    {...register('firstName')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.firstName?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="last-name">
                    {t('fields.lastName.label')}
                  </FieldLabel>

                  <Input
                    id="last-name"
                    disabled={isPending}
                    {...register('lastName')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.lastName?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">
                  {t('fields.email.label')}
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  disabled={isPending}
                  placeholder="m@example.com"
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="username">
                    {t('fields.username.label')}
                  </FieldLabel>

                  <Input
                    id="username"
                    disabled={isPending}
                    {...register('username')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.username?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="mobile-number">
                    {t('fields.phoneNumber.label')}
                  </FieldLabel>

                  <Input
                    id="mobile-number"
                    disabled={isPending}
                    {...register('mobileNumber')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.mobileNumber?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>{t('fields.gender.label')}</FieldLabel>

                  <Controller
                    control={control}
                    name="gender"
                    disabled={isPending}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t('fields.gender.placeholder')}
                          />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="male">
                            {t('fields.gender.options.male')}
                          </SelectItem>

                          <SelectItem value="female">
                            {t('fields.gender.options.female')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.gender?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="dob">
                    {t('fields.dateOfBirth.label')}
                  </FieldLabel>

                  <Input
                    id="dob"
                    type="date"
                    disabled={isPending}
                    {...register('dob')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.dob?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">
                    {t('fields.password.label')}
                  </FieldLabel>

                  <Input
                    id="password"
                    disabled={isPending}
                    type="password"
                    {...register('password')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.password?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    {t('fields.confirmPassword.label')}
                  </FieldLabel>

                  <Input
                    id="confirm-password"
                    type="password"
                    disabled={isPending}
                    {...register('confirmPassword')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.confirmPassword?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center">
                  {t('loginLink.text')}{' '}
                  <Link href="/login">{t('loginLink.linkText')}</Link>
                </FieldDescription>

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={() => navigate('/')}>
                  Continue as guest
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

