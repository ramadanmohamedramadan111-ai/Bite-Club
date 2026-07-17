'use client';
import {
  createCreateGroupSchema,
  CreateGroupSchema,
} from '@/schemas/groups/create-group-schema';
import { GroupType } from '@/types/groups/groups';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { createGroupAction, updateGroupAction } from '@/actions/groups';
import { toast } from 'sonner';
import { mapServerFieldErrors } from '@/utils/server/map-server-field-errors';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function GroupForm({
  type,
  group,
  setOpen,
}: {
  type: 'edit' | 'new';
  group?: GroupType | null;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const isNewGroup = type === 'new';
  const router = useRouter();

  const t = useTranslations('forms.createGroup');

  const schema = createCreateGroupSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    resetField,
    formState: { errors },
  } = useForm<CreateGroupSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: group?.name,
      description: group?.description,
      image: undefined,
    },
  });

  const imageRegister = register('image');

  function removeImage() {
    setImagePreview(null);
    resetField('image');

    setFileInputKey((prev) => prev + 1);
  }

  function resetForm() {
    reset();
    setImagePreview(group?.image_url ?? null);
    setFileInputKey((prev) => prev + 1);
  }

  function handleCancel() {
    resetForm();
    if (isNewGroup && setOpen) {
      setOpen(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    imageRegister.onChange(event);

    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(group?.image_url ?? null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  const Wrapper = isNewGroup ? DialogFooter : 'div';

  const { execute: createForm, isExecuting: isCreating } = useAction(
    createGroupAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
        handleCancel();
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
        if (error.serverError?.data?.errors) {
          mapServerFieldErrors(error.serverError.data.errors, setError);
        }
      },
    },
  );

  const { execute: updateForm, isExecuting: isUpdating } = useAction(
    updateGroupAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
        router.refresh();
        handleCancel();
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
        if (error.serverError?.data?.errors) {
          mapServerFieldErrors(error.serverError.data.errors, setError);
        }
      },
    },
  );

  function onSubmit(data: CreateGroupSchema) {
    if (isNewGroup) {
      createForm(data);
    } else {
      if (group) {
        updateForm({ ...data, id: group.id });
      }
    }
  }

  const disabledCondition = isNewGroup ? isCreating : isUpdating;

  useEffect(() => {
    reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
      image: undefined,
    });

    setImagePreview(group?.image_url ?? null);
  }, [group, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="new-group-name">{t('fields.name.label')}</Label>

        <Input
          id="new-group-name"
          placeholder={t('fields.name.placeholder')}
          disabled={disabledCondition}
          {...register('name')}
        />

        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-group-description">
          {t('fields.description.label')}
        </Label>

        <Input
          id="new-group-description"
          placeholder={t('fields.description.placeholder')}
          disabled={disabledCondition}
          {...register('description')}
        />

        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-group-image">{t('fields.image.label')}</Label>
        <Input
          type="file"
          accept="image/*"
          disabled={disabledCondition}
          onChange={(e) => {
            const file = e.target.files?.[0];

            setValue('image', file, {
              shouldValidate: true,
              shouldDirty: true,
            });

            handleImageChange(e);
          }}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
        {imagePreview && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Group preview"
              className="size-20 rounded-lg object-cover"
            />

            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 size-6 rounded-full"
              onClick={removeImage}>
              <X className="size-3" />
            </Button>
          </div>
        )}{' '}
      </div>

      <Wrapper>
        <Button type="button" variant="outline" onClick={() => handleCancel()}>
          {isNewGroup ? t('cancel') : t('reset')}
        </Button>

        <Button type="submit" disabled={disabledCondition}>
          {disabledCondition
            ? isNewGroup
              ? t('submitButton.loadingText')
              : t('updateButton.loadingText')
            : isNewGroup
              ? t('submitButton.text')
              : t('updateButton.text')}
        </Button>
      </Wrapper>
    </form>
  );
}

