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
  } = useForm<RestaurantRegisterSchema>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      category_id: undefined,
    },
  });

  async function registerRestaurant(data: RestaurantRegisterSchema) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/restaurant/register`,
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
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  }

  const { mutate, isPending } = useMutation({
    mutationFn: registerRestaurant,

    onSuccess(data) {
      toast.success(data.message || 'Successfully registered');
      // navigate('/login?type=restaurant');
    },

    onError(error) {
      console.log('registerRestaurant error:', error);
      toast.error(error.message);
    },
  });

  const onSubmit = (data: RestaurantRegisterSchema) => {
    mutate(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>

          <CardDescription>
            {t('subtitle')}
            {JSON.stringify(categories)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('fields.name.label')}</FieldLabel>

                <Input disabled={isPending} {...register('name')} />

                <FieldDescription className="text-destructive">
                  {errors.name?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.email.label')}</FieldLabel>

                <Input
                  type="email"
                  disabled={isPending}
                  {...register('email')}
                />

                <FieldDescription className="text-destructive">
                  {errors.email?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.phoneNumber.label')}</FieldLabel>

                <Input disabled={isPending} {...register('phone_number')} />

                <FieldDescription className="text-destructive">
                  {errors.phone_number?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.category.label')}</FieldLabel>

                <Controller
                  control={control}
                  name="category_id"
                  disabled={isPending}
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
                        <SelectItem value="1">Pizza</SelectItem>

                        <SelectItem value="2">Burgers</SelectItem>

                        <SelectItem value="3">Drinks</SelectItem>
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
                  disabled={isPending}
                  className="border rounded-md p-2 min-h-28"
                  {...register('description')}
                />

                <FieldDescription className="text-destructive">
                  {errors.description?.message}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>{t('fields.address.label')}</FieldLabel>

                <Input disabled={isPending} {...register('address')} />

                <FieldDescription className="text-destructive">
                  {errors.address?.message}
                </FieldDescription>
              </Field>

              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>{t('fields.password.label')}</FieldLabel>

                  <Input
                    type="password"
                    disabled={isPending}
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
                    disabled={isPending}
                    {...register('password_confirmation')}
                  />

                  <FieldDescription className="text-destructive">
                    {errors.password_confirmation?.message}
                  </FieldDescription>
                </Field>
              </Field>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending
                  ? t('submitButton.loadingText')
                  : t('submitButton.text')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

