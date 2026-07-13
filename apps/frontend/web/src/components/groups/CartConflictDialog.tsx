'use client';

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
      title="Replace your current cart?"
      description={
        currentRestaurantName
          ? `You have an active cart from ${currentRestaurantName}. Switch to the group order at ${newRestaurantName}? Your current cart will be cleared.`
          : `You have an active cart. Switch to the group order at ${newRestaurantName}? Your current cart will be cleared.`
      }
      confirmText="Switch to group order"
      onConfirm={onConfirm}
    />
  );
}
