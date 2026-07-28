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
import { cn } from '@/lib/utils';

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
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/restaurants">{t('browseRestaurants')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      {/* Header section with bottom separator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{t('yourCart')}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t('reviewItems')}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer" disabled={disabledCondition}>
              <Trash2 className="size-4" />
              {t('clearCart')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('clearCartTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('clearCartDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearCart}
                disabled={disabledCondition}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                {t('clearCart')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/30 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  {cart.restaurant?.name || t('restaurant')}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('individualOrder')}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {cartItems.map((item) => (
                <div
                  key={item.item_id}
                  className="space-y-3 rounded-2xl border border-border/40 bg-card/65 p-4 sm:p-5 transition-all duration-300 shadow-xs hover:border-border/75 hover:shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2.5">
                      <p className="font-bold text-base text-foreground leading-snug">{item.item_name}</p>
                      
                      <div className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-xl p-1 w-fit">
                        <button
                          onClick={() =>
                            handleUpdateCart(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || disabledCondition}
                          className="
                            flex h-8 w-8 items-center justify-center cursor-pointer
                            rounded-lg bg-background border border-border/30 hover:bg-accent hover:text-accent-foreground
                            disabled:cursor-not-allowed disabled:opacity-50 transition-all font-semibold
                          ">
                          -
                        </button>

                        <span className="min-w-8 text-center font-bold text-sm text-foreground select-none">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateCart(item.id, item.quantity + 1)
                          }
                          disabled={disabledCondition}
                          className="
                            flex h-8 w-8 items-center justify-center cursor-pointer
                            rounded-lg bg-background border border-border/30 hover:bg-accent hover:text-accent-foreground
                            disabled:cursor-not-allowed disabled:opacity-50 transition-all font-semibold
                          ">
                          +
                        </button>
                      </div>
                    </div>

                    <div className={cn("flex flex-col items-end shrink-0", isRtl ? 'text-left' : 'text-right')}>
                      <p className="font-bold text-base text-primary">
                        {item.total_price.toFixed(2)} EGP
                      </p>
                      <button
                        onClick={() => handleRemoveItemCart(item.id)}
                        disabled={disabledCondition}
                        className="
                          mt-2.5 text-xs text-destructive font-semibold
                          hover:underline hover:text-destructive/90 cursor-pointer
                        ">
                        {t('remove')}
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-xs text-muted-foreground border-t border-border/20 pt-2">
                      <p className="font-semibold text-foreground mb-0.5">{t('note')}</p>
                      <p className="italic">"{item.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base font-bold">{t('orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div className="space-y-4 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-semibold text-foreground">{cart?.subtotal.toFixed(2)} EGP</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span className="text-primary">{cart?.subtotal.toFixed(2)} EGP</span>
            </div>

            <GroupCartActionButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
