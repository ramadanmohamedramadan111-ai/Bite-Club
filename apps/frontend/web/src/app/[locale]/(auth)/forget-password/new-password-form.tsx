'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { clientFetch } from '@/utils/client-fetch';
import { cn } from '@/lib/utils';
import { NewPasswordSchema, useNewPasswordSchema } from './new-password-schema';
import { useRouter } from '@/i18n/navigation';

type NewPasswordFormProps = React.ComponentProps<'div'> & {
  email: string;
};

export default function NewPasswordForm({
  className,
  email,
  ...props
}: NewPasswordFormProps) {
  const t = useTranslations('forms.newPassword');
  const schema = useNewPasswordSchema();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordSchema>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NewPasswordSchema) =>
      clientFetch('/api/auth/update-password', 'POST', {
        body: {
          email,
          password: data.password,
        },
      }),

    onSuccess: () => {
      toast.success(t('success'));
      router.replace('/login');
    },

    onError: () => {
      toast.error(t('error'));
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle', { email })}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">
                  {t('fields.password.label')}
                </FieldLabel>

                <Input
                  id="password"
                  type="password"
                  disabled={isPending}
                  {...register('password')}
                />

                {errors.password && (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  {t('fields.confirmPassword.label')}
                </FieldLabel>

                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isPending}
                  {...register('confirmPassword')}
                />

                {errors.confirmPassword && (
                  <FieldDescription className="text-destructive">
                    {errors.confirmPassword.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? t('submitButton.loadingText')
                    : t('submitButton.text')}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

