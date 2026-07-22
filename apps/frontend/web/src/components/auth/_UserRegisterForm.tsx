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
import {
  createUserRegisterSchema,
  type UserRegisterSchema,
} from '@/schemas/auth/user-register-schema';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { toast } from 'sonner';
import { useState } from 'react';
import VerifyForm from '@/components/auth/verify-form';
import useNavigation from '@/hooks/useNavigation';
import { registerUserAction } from '@/actions/auth/register';

import { useAction } from 'next-safe-action/hooks';
import { serverFetch } from '@/utils/server-fetch';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const t = useTranslations('forms.register');
  const registerSchema = createUserRegisterSchema(t);

  const [step, setStep] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: undefined,
    },
  });

  const email = watch('email');

  const { navigate } = useNavigation();

  const { mutate: registerUser, isPending: isExecuting } = useMutation({
    mutationFn: async (data: UserRegisterSchema) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? 'Registration failed');
      }

      return result;
    },

    onSuccess() {
      setStep(2);
    },

    onError(error) {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UserRegisterSchema) => {
    registerUser(data);
  };

  if (step === 2) {
    return <VerifyForm email={email} purpose="login" type="user" />;
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
                    disabled={isExecuting}
                    {...register('first_name')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.first_name?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="last-name">
                    {t('fields.lastName.label')}
                  </FieldLabel>

                  <Input
                    id="last-name"
                    disabled={isExecuting}
                    {...register('last_name')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.last_name?.message}
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
                  disabled={isExecuting}
                  placeholder={t('fields.email.placeholder')}
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
                    disabled={isExecuting}
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
                    disabled={isExecuting}
                    {...register('phone_number')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.phone_number?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>{t('fields.gender.label')}</FieldLabel>

                  <Controller
                    control={control}
                    name="gender"
                    disabled={isExecuting}
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
                    disabled={isExecuting}
                    {...register('date_of_birth')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.date_of_birth?.message}
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
                    disabled={isExecuting}
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
                    disabled={isExecuting}
                    {...register('password_confirmation')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.password_confirmation?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Field>
                <Button type="submit" disabled={isExecuting} className="w-full">
                  {isExecuting
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

