'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { X, Trash2 } from 'lucide-react';
import GroupCartActionButton from './GroupCartActionButton';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCartStore } from '@/stores/cart';
import { IndividualCartResponse } from '@/types/cart/cart';
import { useAction } from 'next-safe-action/hooks';
import {
  clearIndividualCartAction,
  removeIndividualCartItemAction,
  updateIndividualCartItemQuantityAction,
} from '@/actions/cart';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  initialCart?: IndividualCartResponse;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const cartItems = cart?.items || [];

  const { execute: clearCartExecute, isExecuting: isClearingCart } = useAction(
    clearIndividualCartAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: updateCartExecute, isExecuting: isUpdatingCart } = useAction(
    updateIndividualCartItemQuantityAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: removeCartItemExecute, isExecuting: isRemovingItemCart } =
    useAction(removeIndividualCartItemAction, {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    });

  const handleClearCart = () => {
    if (isAuthenticated) {
      clearCartExecute();
    } else {
      clearCart();
    }
  };

  const handleUpdateCart = (id: number, quantity: number) => {
    if (isAuthenticated) {
      updateCartExecute({ id, quantity });
    } else {
      updateQuantity(id, quantity);
    }
  };

  const handleRemoveItemCart = (item_id: number) => {
    if (isAuthenticated) {
      removeCartItemExecute(item_id);
    } else {
      removeItem(item_id);
    }
  };

  const disabledCondition =
    isClearingCart || isUpdatingCart || isRemovingItemCart;

  return (
    <aside
      className={`
        fixed top-[64px] z-50
        ${isRtl ? 'left-0' : 'right-0'}
        flex h-[calc(100vh-64px)] w-[320px] sm:w-[400px] flex-col
        ${isRtl ? 'border-r' : 'border-l'} border-border
        bg-background text-foreground
        shadow-xl
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'}
      `}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div>
            <h2>{t('yourCart')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('individualOrder')} {cart?.restaurant && `(${cart.restaurant.name})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {cart && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="
                    flex items-center gap-1 rounded-md px-2 py-1
                    text-sm text-destructive
                    hover:bg-destructive/10
                  ">
                  <Trash2 size={15} />
                  {t('clearCart')}
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('clearCartTitle')}</AlertDialogTitle>

                  <AlertDialogDescription>
                    {t('clearCartDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleClearCart}
                    disabled={disabledCondition}
                    className="
                      bg-destructive text-destructive-foreground
                      hover:bg-destructive/90
                    ">
                    {t('clearCart')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <button
            onClick={onClose}
            className="
            rounded-md p-2
            hover:bg-accent
            hover:text-accent-foreground
          ">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <p className="text-muted-foreground">{t('yourCartIsEmpty')}</p>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.item_id}
                className="space-y-2 rounded-md border p-3">
                {/* Main item */}
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateCart(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || disabledCondition}
                        className="
      flex h-7 w-7 items-center justify-center
      rounded-md border
      hover:bg-accent
      disabled:cursor-not-allowed
      disabled:opacity-50
    ">
                        -
                      </button>

                      <span className="min-w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleUpdateCart(item.id, item.quantity + 1)
                        }
                        disabled={disabledCondition}
                        className="
      flex h-7 w-7 items-center justify-center
      rounded-md border
      hover:bg-accent
    ">
                        +
                      </button>
                    </div>{' '}
                  </div>

                  <div>
                    <p className="font-medium">
                      {t('egp')} {item.total_price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItemCart(item.id)}
                      disabled={disabledCondition}
                      className="
    text-sm text-destructive
    hover:underline
  ">
                      {t('remove')}
                    </button>
                  </div>
                </div>

                {/* Special instructions */}
                {item.notes && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{t('note')}</p>

                    <p>{item.notes}</p>
                  </div>
                )}

                {/* Group order info */}
                {/* {cart.type === 'group' && item.addedBy?.name && (
                  <p className="text-xs text-muted-foreground">
                    Added by {item.addedBy.name}
                  </p>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="shrink-0 space-y-2 border-t border-border p-4">
          {/* {cart?.type === 'individual' && <CartRedemptionSelector />}
          {cart?.type === 'group' && (
            <div className="space-y-1 pb-2 text-sm">
              {groupCartItemsByUser(cartItems).map((group) => (
                <div key={group.key} className="flex justify-between">
                  <span className="text-muted-foreground">{group.name}</span>
                  <span>EGP {group.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )} */}

          <div className="flex justify-between text-sm">
            <span>{t('subtotal')}</span>

            <span>{t('egp')} {cart?.subtotal.toFixed(2)}</span>
          </div>

          {/* <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>

            <span>EGP{summary.deliveryFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax</span>

            <span>EGP{summary.tax.toFixed(2)}</span>
          </div> */}

          {/* {summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span>
                Discount
                {summary.appliedRedemptionTitle
                  ? ` (${summary.appliedRedemptionTitle})`
                  : ''}
              </span>

              <span>EGP-{summary.discount.toFixed(2)}</span>
            </div>
          )} */}

          {/* <div className="flex justify-between pt-2 text-lg font-semibold">
            <span>Total</span>

            <span>EGP {summary.total.toFixed(2)}</span>
          </div> */}

          <GroupCartActionButton onCheckout={onClose} />
        </div>
      )}
    </aside>
  );
}

