'use client';

import { X, Trash2 } from 'lucide-react';
import { useCartStore } from '../../stores/cart';
import { groupCartItemsByUser } from '@/utils/cart-grouping';
import GroupCartActionButton from './GroupCartActionButton';
import GroupCartItemsList from './GroupCartItemsList';
import CartRedemptionSelector from './CartRedemptionSelector';

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

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSummary = useCartStore((state) => state.getSummary);

  const summary = getSummary();
  const cartItems = cart?.items ?? [];

  return (
    <aside
      className={`
        fixed top-[64px] right-0 z-50
        flex h-[calc(100vh-64px)] w-[400px] flex-col
        border-l border-border
        bg-background text-foreground
        shadow-xl
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          {cart?.restaurantImage && (
            <img
              src={cart.restaurantImage}
              alt={cart.restaurantName}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}

          <div>
            <h2 className="text-lg font-semibold">
              {cart?.restaurantName ?? 'Your Cart'}
            </h2>

            {cart?.type === 'group' && (
              <p className="text-xs text-muted-foreground">Group Order</p>
            )}
          </div>

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
                  Clear
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>

                  <AlertDialogDescription>
                    This will remove all items from your cart. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction
                    onClick={clearCart}
                    className="
                      bg-destructive text-destructive-foreground
                      hover:bg-destructive/90
                    ">
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

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

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <p className="text-muted-foreground">Your cart is empty</p>
        ) : cart?.type === 'group' ? (
          <GroupCartItemsList
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            compact
          />
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="space-y-2 rounded-md border p-3">
                {/* Main item */}
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
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
                          updateQuantity(item.cartItemId, item.quantity + 1)
                        }
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
                      EGP {item.totalPrice.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="
    text-sm text-destructive
    hover:underline
  ">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Selected options */}
                {item.selectedOptions.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Options:</p>

                    <ul className="list-disc pl-4">
                      {item.selectedOptions.map((option) => (
                        <li key={option.optionId}>
                          {option.groupName}: {option.optionName}
                          {option.price > 0 && (
                            <span>
                              {' '}
                              (+EGP
                              {option.price.toFixed(2)})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Special instructions */}
                {item.specialInstructions && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Note:</p>

                    <p>{item.specialInstructions}</p>
                  </div>
                )}

                {/* Group order info */}
                {cart.type === 'group' && item.addedBy?.name && (
                  <p className="text-xs text-muted-foreground">
                    Added by {item.addedBy.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="shrink-0 space-y-2 border-t border-border p-4">
          {cart?.type === 'individual' && <CartRedemptionSelector />}
          {cart?.type === 'group' && (
            <div className="space-y-1 pb-2 text-sm">
              {groupCartItemsByUser(cartItems).map((group) => (
                <div key={group.key} className="flex justify-between">
                  <span className="text-muted-foreground">{group.name}</span>
                  <span>EGP {group.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>

            <span>EGP {summary.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>

            <span>EGP{summary.deliveryFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax</span>

            <span>EGP{summary.tax.toFixed(2)}</span>
          </div>

          {summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span>
                Discount
                {summary.appliedRedemptionTitle
                  ? ` (${summary.appliedRedemptionTitle})`
                  : ''}
              </span>

              <span>EGP-{summary.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 text-lg font-semibold">
            <span>Total</span>

            <span>EGP {summary.total.toFixed(2)}</span>
          </div>

          <GroupCartActionButton onCheckout={onClose} />
        </div>
      )}
    </aside>
  );
}
