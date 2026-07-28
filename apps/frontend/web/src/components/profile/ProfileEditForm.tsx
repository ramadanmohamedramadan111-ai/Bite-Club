'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { editUserAction } from '@/actions/profile';
import { mapServerFieldErrors } from '@/utils/map-server-field-errors';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { UserResponse } from '@/types/user';

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
      <Card className="w-full">
        <CardContent className="pt-6 space-y-6">
          
          {/* Profile Photo selector */}
          <div className="space-y-3.5">
            <Label className="font-bold text-sm text-foreground">{tCommon('profilePhoto')}</Label>
            <div className="flex items-center gap-4.5">
              <Avatar className="h-16 w-16 rounded-full border border-border shadow-xs">
                <AvatarImage src={previewUrl} className="object-cover" />
                <AvatarFallback className="font-bold text-base bg-accent text-accent-foreground">
                  {user.first_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 px-4 font-bold text-xs cursor-pointer border-border hover:bg-accent"
                onClick={() => fileInputRef.current?.click()}>
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
              <p className="text-xs text-destructive font-semibold">
                {errors.image.message as string}
              </p>
            )}
          </div>

          {/* First Name Input */}
          <div className="space-y-2">
            <Label htmlFor="first_name" className="font-bold text-sm text-foreground">{tFields('firstName.label')}</Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder={tFields('firstName.placeholder')}
              className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
            />
            {errors.first_name && (
              <p className="text-xs text-destructive font-semibold">
                {errors.first_name.message as string}
              </p>
            )}
          </div>

          {/* Last Name Input */}
          <div className="space-y-2">
            <Label htmlFor="last_name" className="font-bold text-sm text-foreground">{tFields('lastName.label')}</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder={tFields('lastName.placeholder')}
              className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
            />
            {errors.last_name && (
              <p className="text-xs text-destructive font-semibold">
                {errors.last_name.message as string}
              </p>
            )}
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-bold text-sm text-foreground">{tFields('username.label')}</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder={tFields('username.placeholder')}
              className="rounded-xl h-10 border-border focus-visible:ring-primary/20"
            />
            {errors.username && (
              <p className="text-xs text-destructive font-semibold">
                {errors.username.message as string}
              </p>
            )}
          </div>

          {/* Buttons panel */}
          <div className="flex gap-3 pt-2">
            <Link href="/profile" className="flex-1 cursor-pointer">
              <Button variant="outline" className="w-full rounded-xl h-10 font-bold border-border/80 text-sm hover:bg-accent cursor-pointer" type="button">
                {tCommon('cancel')}
              </Button>
            </Link>
            <Button
              className="flex-1 rounded-xl h-10 font-bold text-sm cursor-pointer"
              type="submit"
              disabled={isSubmitting || isExecuting}>
              {isSubmitting || isExecuting ? tCommon('saving') : tCommon('save')}
            </Button>
          </div>
          
        </CardContent>
      </Card>
    </form>
  );
}
