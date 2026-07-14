'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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

import {
  createRestaurantRegisterSchema,
  type RestaurantRegisterSchema,
} from '@/schemas/auth/restaurant-register-schema';
import { useAction } from 'next-safe-action/hooks';
import useNavigation from '@/hooks/useNavigation';
import { registerRestaurantAction } from '@/actions/auth/register-restaurant';
import { mapServerFieldErrors } from '@/utils/server/map-server-field-errors';
import { Link } from '@/i18n/navigation';

export function RestaurantRegisterForm({
  className,
  categories,
  ...props
}: React.ComponentProps<'div'> & {
  categories: { id: number; name: string }[];
}) {
  const t = useTranslations('forms.registerRestaurant');
  const { navigate } = useNavigation();

  const restaurantSchema = createRestaurantRegisterSchema(t);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RestaurantRegisterSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      category_id: undefined,
    },
  });

  const { execute: registerRestaurant, isExecuting } = useAction(
    registerRestaurantAction,
    {
      onSuccess: ({ data }) => {
        console.log('Registration successful:', data);
        toast.success(data?.message || t('success'));
        navigate('/login?type=restaurant');
      },
      onError: ({ error }) => {
        if (error.serverError?.data?.errors) {
          mapServerFieldErrors(error.serverError.data.errors, setError);
        }

        toast.error(error.serverError?.message || t('error'));
      },
    },
  );
  const onSubmit = (data: RestaurantRegisterSchema) => {
    registerRestaurant(data);
  };

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
              <Field>
                <FieldLabel>{t('fields.name.label')}</FieldLabel>

                <Input disabled={isExecuting} {...register('name')} />

                <FieldDescription className="text-destructive">
                  {errors.name?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.email.label')}</FieldLabel>

                <Input
                  type="email"
                  disabled={isExecuting}
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.phoneNumber.label')}</FieldLabel>

                <Input disabled={isExecuting} {...register('phone_number')} />

                <FieldDescription className="text-destructive">
                  {errors.phone_number?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.category.label')}</FieldLabel>

                <Controller
                  control={control}
                  name="category_id"
                  disabled={isExecuting}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t('fields.category.placeholder')}
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FieldDescription className="text-destructive">
                  {errors.category_id?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.description.label')}</FieldLabel>

                <textarea
                  disabled={isExecuting}
                  className="border rounded-md p-2 min-h-28"
                  {...register('description')}
                />

                <FieldDescription className="text-destructive">
                  {errors.description?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.address.label')}</FieldLabel>

                <Input disabled={isExecuting} {...register('address')} />

                <FieldDescription className="text-destructive">
                  {errors.address?.message}
                </FieldDescription>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>{t('fields.password.label')}</FieldLabel>

                  <Input
                    type="password"
                    disabled={isExecuting}
                    {...register('password')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.password?.message}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>{t('fields.confirmPassword.label')}</FieldLabel>

                  <Input
                    type="password"
                    disabled={isExecuting}
                    {...register('password_confirmation')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.password_confirmation?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Button type="submit" disabled={isExecuting} className="w-full">
                {isExecuting
                  ? t('submitButton.loadingText')
                  : t('submitButton.text')}
              </Button>
              <FieldDescription className="text-center">
                {t('loginLink.text')}{' '}
                <Link
                  href="/login?type=restaurant"
                  className="text-primary underline hover:no-underline">
                  {t('loginLink.linkText')}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

