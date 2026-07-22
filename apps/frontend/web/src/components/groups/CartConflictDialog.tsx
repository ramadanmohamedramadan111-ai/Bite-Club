'use client';

import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRestaurantName?: string;
  newRestaurantName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CartConflictDialog({
  open,
  onOpenChange,
  currentRestaurantName,
  newRestaurantName,
  onConfirm,
  onCancel,
}: Props) {
  const t = useTranslations('groups');

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onCancel();
    }

    onOpenChange(nextOpen);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('replaceCartTitle')}
      description={
        currentRestaurantName
          ? t('replaceCartDescGroup', { current: currentRestaurantName, new: newRestaurantName })
          : t('replaceCartDescGeneric', { new: newRestaurantName })
      }
      confirmText={t('switchToGroupOrder')}
      onConfirm={onConfirm}
    />
  );
}
