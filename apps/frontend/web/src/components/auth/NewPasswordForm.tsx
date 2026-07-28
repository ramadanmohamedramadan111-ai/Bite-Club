'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import {
  createNewPasswordSchema,
  NewPasswordSchema,
} from '@/schemas/auth/new-password-schema';
import { resetPasswordAction } from '@/actions/auth';

type NewPasswordFormProps = React.ComponentProps<'div'> & {
  email: string;
};

export default function NewPasswordForm({
  className,
  email,
  ...props
}: NewPasswordFormProps) {
  const t = useTranslations('forms.newPassword');
  const schema = createNewPasswordSchema(t);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordSchema>({
    resolver: zodResolver(schema),
  });

  const { execute: resetPassword, isExecuting } = useAction(
    resetPasswordAction,
    {
      onSuccess: () => {
        toast.success(t('success'));
        router.replace('/login');
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || t('error'));
      },
    },
  );

  const onSubmit = (data: NewPasswordSchema) => {
    resetPassword({
      email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle', { email })}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
              <Field className="space-y-2">
                <FieldLabel htmlFor="password" className="font-semibold text-sm text-foreground">
                  {t('fields.password.label')}
                </FieldLabel>

                <Input
                  id="password"
                  type="password"
                  disabled={isExecuting}
                  {...register('password')}
                  className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                />

                {errors.password && (
                  <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              <Field className="space-y-2">
                <FieldLabel htmlFor="confirmPassword" className="font-semibold text-sm text-foreground">
                  {t('fields.confirmPassword.label')}
                </FieldLabel>

                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isExecuting}
                  {...register('password_confirmation')}
                  className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
                />

                {errors.password_confirmation && (
                  <FieldDescription className="text-xs text-destructive font-semibold mt-1">
                    {errors.password_confirmation.message}
                  </FieldDescription>
                )}
              </Field>

              <Field className="space-y-3.5 pt-2">
                <Button type="submit" disabled={isExecuting} className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer">
                  {isExecuting
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
