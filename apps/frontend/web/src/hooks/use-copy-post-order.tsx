'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { copyOrderAction } from '@/actions/feed';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import type { PostType } from '@/types/posts';

export function useCopyPostOrder() {
  const router = useRouter();
  const tc = useTranslations('common');
  const tCustomizer = useTranslations('restaurants');
  const [replaceCartDialogOpen, setReplaceCartDialogOpen] = useState(false);
  const [selectedPostToCopy, setSelectedPostToCopy] =
    useState<PostType | null>(null);
  const cart = useCartStore((state) => state.cart);

  const { execute: copyOrder, isExecuting: isCopying } = useAction(
    copyOrderAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message || tc('copySuccess'));
          router.push('/cart');
        } else {
          toast.error(data?.message || tc('copyFailed'));
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || tc('copyFailed'));
      },
    },
  );

  const handleAddToCart = (post: PostType) => {
    if (cart && cart.restaurant.id !== post.restaurant.id) {
      setSelectedPostToCopy(post);
      setReplaceCartDialogOpen(true);
      return;
    }
    copyOrder(Number(post.id));
  };

  const confirmReplace = () => {
    if (selectedPostToCopy) {
      copyOrder(Number(selectedPostToCopy.id));
    }
    setReplaceCartDialogOpen(false);
  };

  const confirmDialog = selectedPostToCopy ? (
    <ConfirmDialog
      open={replaceCartDialogOpen}
      onOpenChange={setReplaceCartDialogOpen}
      title={tCustomizer('copyOrderTitle')}
      description={tCustomizer('copyOrderDesc', {
        current: cart?.restaurant.name || '',
        new: selectedPostToCopy.restaurant.name,
      })}
      confirmText={tCustomizer('copyOrder')}
      cancelText={tCustomizer('keepCurrentCart')}
      onConfirm={confirmReplace}
      isLoading={isCopying}
    />
  ) : null;

  return { handleAddToCart, confirmDialog };
}
