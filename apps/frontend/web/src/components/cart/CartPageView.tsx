'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
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
import CartItemRow from './CartItemRow';
import CartTotals from './CartTotals';

export default function CartPageView() {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSummary = useCartStore((state) => state.getSummary);

  const summary = getSummary();
  const cartItems = cart?.items ?? [];

  if (!cart || cartItems.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse restaurants and add items to get started.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurants">Browse restaurants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="mt-1 text-muted-foreground">
            Review your items before checkout
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive">
              <Trash2 className="size-4" />
              Clear cart
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all items from your cart. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearCart}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              {cart.restaurantImage && (
                <div className="relative size-12 overflow-hidden rounded-lg">
                  <Image
                    src={cart.restaurantImage}
                    alt={cart.restaurantName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-base">{cart.restaurantName}</CardTitle>
                {cart.type === 'group' && (
                  <p className="text-xs text-muted-foreground">Group order</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  isGroupCart={cart.type === 'group'}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CartTotals summary={summary} />
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
