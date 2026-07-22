'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { editUserAction } from '@/actions/profile';
import { mapServerFieldErrors } from '@/utils/server/map-server-field-errors';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { UserResponse } from '@/types/profile/user';

type Props = {
  user: UserResponse;
};

export function ProfileEditForm({ user }: Props) {
  const tCommon = useTranslations('common');
  const tFields = useTranslations('forms.editUser.fields');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      image: undefined as File | undefined,
    },
  });

  const { execute: editProfile, isExecuting } = useAction(editUserAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        router.push('/profile');
      } else if (data?.data && typeof data.data === 'object') {
        mapServerFieldErrors(data.data as any, setError as any);
        toast.error(data.message);
      } else {
        toast.error(data?.message);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
    }
  };

  const watchedImage = watch('image');

  const onSubmit = handleSubmit((formData) => {
    editProfile(formData);
  });

  const previewUrl = watchedImage
    ? URL.createObjectURL(watchedImage)
    : user.profile_image || undefined;

  return (
    <form onSubmit={onSubmit}>
      <Card className="mx-auto max-w-lg space-y-6 p-6">
        <div className="space-y-3">
          <Label>{tCommon('profilePhoto')}</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={previewUrl} />
              <AvatarFallback>
                {user.first_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {tCommon('changePhoto')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          {errors.image && (
            <p className="text-sm text-destructive">
              {errors.image.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">{tFields('firstName.label')}</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder={tFields('firstName.placeholder')}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">
              {errors.first_name.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">{tFields('lastName.label')}</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder={tFields('lastName.placeholder')}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">
              {errors.last_name.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">{tFields('username.label')}</Label>
          <Input
            id="username"
            {...register('username')}
            placeholder={tFields('username.placeholder')}
          />
          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message as string}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full" type="button">
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button
            className="flex-1"
            type="submit"
            disabled={isSubmitting || isExecuting}
          >
            {isSubmitting || isExecuting ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      </Card>
    </form>
  );
}
