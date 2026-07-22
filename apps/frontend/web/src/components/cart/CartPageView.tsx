'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAction } from 'next-safe-action/hooks';
import {
  clearIndividualCartAction,
  removeIndividualCartItemAction,
  updateIndividualCartItemQuantityAction,
} from '@/actions/cart';
import { toast } from 'sonner';
import GroupCartActionButton from './GroupCartActionButton';

export default function CartPageView() {
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

  if (!cart || cartItems.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold">{t('yourCartIsEmpty')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('browseRestaurantsDesc')}
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurants">{t('browseRestaurants')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('yourCart')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('reviewItems')}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive" disabled={disabledCondition}>
              <Trash2 className="size-4" />
              {t('clearCart')}
            </Button>
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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('clearCart')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div>
                <CardTitle className="text-base">
                  {cart.restaurant?.name || t('restaurant')}
                </CardTitle>

                  <p className="text-xs text-muted-foreground">
                    {t('individualOrder')}
                  </p>
                {/* {cart.type === 'group' && (
                  <p className="text-xs text-muted-foreground">Group order</p>
                )} */}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* {cart.type === 'group' ? (
                <GroupCartItemsList
                  items={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ) : ( ... ) */}
              {cartItems.map((item) => (
                <div
                  key={item.item_id}
                  className="space-y-2 rounded-md border p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <p className="font-semibold text-base">{item.item_name}</p>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateCart(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || disabledCondition}
                          className="
                            flex h-8 w-8 items-center justify-center
                            rounded-md border border-input bg-background
                            hover:bg-accent hover:text-accent-foreground
                            disabled:cursor-not-allowed disabled:opacity-50
                          ">
                          -
                        </button>

                        <span className="min-w-6 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateCart(item.id, item.quantity + 1)
                          }
                          disabled={disabledCondition}
                          className="
                            flex h-8 w-8 items-center justify-center
                            rounded-md border border-input bg-background
                            hover:bg-accent hover:text-accent-foreground
                            disabled:cursor-not-allowed disabled:opacity-50
                          ">
                          +
                        </button>
                      </div>
                    </div>

                    <div className={isRtl ? 'text-left' : 'text-right'}>
                      <p className="font-bold text-base">
                        {t('egp')} {item.total_price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItemCart(item.id)}
                        disabled={disabledCondition}
                        className="
                          mt-2 text-sm text-destructive
                          hover:underline hover:text-destructive/90
                        ">
                        {t('remove')}
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-sm text-muted-foreground border-t border-muted-foreground/5 pt-2">
                      <p className="font-medium text-foreground">{t('note')}</p>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {/* {cart.type === 'group' && item.addedBy?.name && (
                    <p className="text-xs text-muted-foreground">
                      Added by {item.addedBy.name}
                    </p>
                  )} */}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">{t('orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* {cart.type === 'individual' && <CartRedemptionSelector />}
            {cart.type === 'group' ? (
              <GroupCartTotals items={cartItems} summary={summary} />
            ) : ( ... ) */}
            
            <div className="space-y-4 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-medium">{t('egp')} {cart?.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span>{t('egp')} {cart?.subtotal.toFixed(2)}</span>
            </div>

            <GroupCartActionButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


