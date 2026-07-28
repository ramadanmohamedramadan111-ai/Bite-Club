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
import { toast } from 'sonner';
import useNavigation from '@/hooks/useNavigation';

import { useAction } from 'next-safe-action/hooks';
import { mapServerFieldErrors } from '@/utils/map-server-field-errors';
import { registerUserAction } from '@/actions/auth';

export function RegisterForm({
  className,
  referrer_code,
  ...props
}: React.ComponentProps<'div'> & { referrer_code?: string }) {
  const t = useTranslations('forms.register');
  const registerSchema = createUserRegisterSchema(t);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: undefined,
      referrer_code: referrer_code || '',
    },
  });

  const { navigate } = useNavigation();

  const { execute: registerUser, isExecuting } = useAction(registerUserAction, {
    onSuccess: ({ data }) => {
      toast.success(data.message || t('success'));
      navigate('/login');
    },
    onError: ({ error }) => {
      if (error.serverError?.data?.errors) {
        mapServerFieldErrors(error.serverError.data.errors, setError);
      }
      toast.error(error.serverError?.message || t('error'));
    },
  });
  const onSubmit = (data: UserRegisterSchema) => {
    registerUser(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="first-name" className="font-semibold text-sm text-foreground">
                    {t('fields.firstName.label')}
                  </FieldLabel>
                  <Input
                    id="first-name"
                    disabled={isExecuting}
                    {...register('first_name')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.first_name?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.first_name?.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="last-name" className="font-semibold text-sm text-foreground">
                    {t('fields.lastName.label')}
                  </FieldLabel>
                  <Input
                    id="last-name"
                    disabled={isExecuting}
                    {...register('last_name')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.last_name?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.last_name?.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field className="space-y-2">
                <FieldLabel htmlFor="email" className="font-semibold text-sm text-foreground">
                  {t('fields.email.label')}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled={isExecuting}
                  placeholder={t('fields.email.placeholder')}
                  {...register('email')}
                  className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                />
                {errors.email?.message && (
                  <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                    {errors.email?.message}
                  </FieldDescription>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="username" className="font-semibold text-sm text-foreground">
                    {t('fields.username.label')}
                  </FieldLabel>
                  <Input
                    id="username"
                    disabled={isExecuting}
                    {...register('username')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.username?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.username?.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="mobile-number" className="font-semibold text-sm text-foreground">
                    {t('fields.phoneNumber.label')}
                  </FieldLabel>
                  <Input
                    id="mobile-number"
                    disabled={isExecuting}
                    {...register('phone_number')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.phone_number?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.phone_number?.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field className="space-y-2">
                  <FieldLabel className="font-semibold text-sm text-foreground">{t('fields.gender.label')}</FieldLabel>
                  <Controller
                    control={control}
                    name="gender"
                    disabled={isExecuting}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger className="w-full rounded-xl h-10 border-border focus-visible:ring-primary/20">
                          <SelectValue
                            placeholder={t('fields.gender.placeholder')}
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl p-1">
                          <SelectItem value="male" className="rounded-lg">
                            {t('fields.gender.options.male')}
                          </SelectItem>
                          <SelectItem value="female" className="rounded-lg">
                            {t('fields.gender.options.female')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.gender?.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="dob" className="font-semibold text-sm text-foreground">
                    {t('fields.dateOfBirth.label')}
                  </FieldLabel>
                  <Input
                    id="dob"
                    type="date"
                    disabled={isExecuting}
                    {...register('date_of_birth')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.date_of_birth?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.date_of_birth?.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="password" className="font-semibold text-sm text-foreground">
                    {t('fields.password.label')}
                  </FieldLabel>
                  <Input
                    id="password"
                    disabled={isExecuting}
                    type="password"
                    {...register('password')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.password?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.password?.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field className="space-y-2">
                  <FieldLabel htmlFor="confirm-password" className="font-semibold text-sm text-foreground">
                    {t('fields.confirmPassword.label')}
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    disabled={isExecuting}
                    {...register('password_confirmation')}
                    className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                  />
                  {errors.password_confirmation?.message && (
                    <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                      {errors.password_confirmation?.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field className="space-y-3.5 pt-2">
                <Button type="submit" disabled={isExecuting} className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer">
                  {isExecuting
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>

                <FieldDescription className="text-center text-xs text-muted-foreground">
                  {t('loginLink.text')}{' '}
                  <Link href="/login" className="font-bold text-primary hover:underline">
                    {t('loginLink.linkText')}
                  </Link>
                </FieldDescription>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl h-10 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
