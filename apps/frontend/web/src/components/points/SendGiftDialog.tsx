'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { Gift } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { sendGiftAction } from '@/actions/points';
import { createSendUserPointsSchema } from '@/schemas/points/send-user-points-schema';
import type { SendUserPointsSchema } from '@/schemas/points/send-user-points-schema';
import { mapServerFieldErrors } from '@/utils/server/map-server-field-errors';

type Friend = {
  id: number;
  full_name: string;
  username: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: Friend;
};

export default function SendGiftDialog({ open, onOpenChange, friend }: Props) {
  const t = useTranslations('forms.sendGift');
  const tp = useTranslations('points');

  const schema = createSendUserPointsSchema(t);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SendUserPointsSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      receiver_id: friend.id,
      points: undefined,
      note: '',
    },
  });

  const { execute, isExecuting } = useAction(sendGiftAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || tp('giftSent'));
      onOpenChange(false);
      reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || tp('giftSendFailed'));
      if (error.serverError?.data?.errors) {
        mapServerFieldErrors(error.serverError.data.errors, setError);
      }
    },
  });

  function onSubmit(data: SendUserPointsSchema) {
    execute(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', {
              name: friend.full_name,
              username: friend.username,
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>{t('fields.points.label')}</FieldLabel>
              <Input
                type="number"
                inputMode="numeric"
                disabled={isExecuting}
                placeholder={t('fields.points.placeholder')}
                {...register('points', {
                  setValueAs: (v: string) => {
                    const num = parseInt(v.replace(/\D/g, ''), 10);
                    return isNaN(num) ? undefined : num;
                  },
                })}
              />
              {errors.points && (
                <FieldDescription className="text-destructive">
                  {errors.points.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel>{t('fields.note.label')}</FieldLabel>
              <Input
                disabled={isExecuting}
                placeholder={t('fields.note.placeholder')}
                {...register('note')}
              />
              {errors.note && (
                <FieldDescription className="text-destructive">
                  {errors.note.message}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExecuting}>
              {tp('cancel')}
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? tp('send') : tp('send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

