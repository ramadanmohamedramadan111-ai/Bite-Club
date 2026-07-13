'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

import CartConflictDialog from '@/components/groups/CartConflictDialog';
import GroupCartActionButton from '@/components/cart/GroupCartActionButton';
import GroupCartItemsList from '@/components/cart/GroupCartItemsList';
import GroupCartTotals from '@/components/cart/GroupCartTotals';
import RestaurantMenuView from '@/components/restaurants/RestaurantMenuView';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getMenuItemsByRestaurantId,
  getRestaurantById,
} from '@/data/restaurant-details';
import { Link, useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
import { useGroupSessionsStore } from '@/stores/group-sessions';
import { useSessionStore } from '@/stores/session';
import type { CartMember } from '@/types/cart/cart';

type Props = {
  sessionId: string;
};

function findCurrentMember(
  members: CartMember[],
  guestSessionId: string | null,
): CartMember | undefined {
  return members.find((member) => member.sessionId === guestSessionId);
}

export default function GroupOrderPageView({ sessionId }: Props) {
  const router = useRouter();
  const session = useGroupSessionsStore((state) =>
    state.sessions.find((entry) => entry.id === sessionId),
  );
  const cart = useCartStore((state) => state.cart);
  const createGroupCart = useCartStore((state) => state.createGroupCart);
  const addMember = useCartStore((state) => state.addMember);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSummary = useCartStore((state) => state.getSummary);
  const guestSessionId = useSessionStore((state) => state.sessionId);
  const guestName = useSessionStore((state) => state.name);

  const [conflictOpen, setConflictOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const restaurant = session
    ? getRestaurantById(Number(session.restaurantId))
    : undefined;
  const menuItems = session
    ? getMenuItemsByRestaurantId(Number(session.restaurantId))
    : [];

  const isCurrentSessionCart =
    cart?.type === 'group' && cart.groupSession.id === sessionId;

  const hasConflictingCart =
    cart !== null &&
    (cart.type !== 'group' || cart.groupSession.id !== sessionId);

  const isSessionOwner = useMemo(() => {
    if (!session) {
      return false;
    }

    if (session.ownerSessionId) {
      return session.ownerSessionId === guestSessionId;
    }

    if (isCurrentSessionCart) {
      return findCurrentMember(cart.members, guestSessionId)?.isOwner ?? false;
    }

    return false;
  }, [session, guestSessionId, isCurrentSessionCart, cart]);

  useEffect(() => {
    if (!session || initialized) {
      return;
    }

    if (hasConflictingCart) {
      setConflictOpen(true);
      return;
    }

    if (!isCurrentSessionCart) {
      switchToSessionCart();
      return;
    }

    ensureCurrentMemberInCart();
    setInitialized(true);
  }, [session, hasConflictingCart, isCurrentSessionCart, initialized]);

  function ensureCurrentMemberInCart() {
    if (!cart || cart.type !== 'group' || !guestSessionId) {
      return;
    }

    const alreadyMember = cart.members.some(
      (member) => member.sessionId === guestSessionId,
    );

    if (!alreadyMember && !isSessionOwner) {
      addMember({
        id: crypto.randomUUID(),
        sessionId: guestSessionId,
        name: guestName ?? 'Guest',
        isOwner: false,
        isReady: false,
      });
    }
  }

  function switchToSessionCart() {
    if (!session) {
      return;
    }

    const displayName = guestName ?? 'Guest';
    const hostSessionId = session.ownerSessionId ?? guestSessionId ?? crypto.randomUUID();
    const isOwner = hostSessionId === guestSessionId;

    if (isOwner) {
      createGroupCart({
        restaurantId: session.restaurantId,
        restaurantName: session.restaurantName,
        restaurantImage: session.restaurantImage,
        groupCart: {
          id: session.id,
          type: session.type === 'anonymous' ? 'temporary' : 'fixed',
          code: session.code,
          groupId: session.groupId,
          expiresAt: session.expiresAt
            ? new Date(session.expiresAt)
            : undefined,
        },
        sessionId: guestSessionId ?? undefined,
        owner: {
          id: crypto.randomUUID(),
          sessionId: guestSessionId ?? undefined,
          name: displayName,
          isOwner: true,
        },
      });
    } else {
      createGroupCart({
        restaurantId: session.restaurantId,
        restaurantName: session.restaurantName,
        restaurantImage: session.restaurantImage,
        groupCart: {
          id: session.id,
          type: session.type === 'anonymous' ? 'temporary' : 'fixed',
          code: session.code,
          groupId: session.groupId,
          expiresAt: session.expiresAt
            ? new Date(session.expiresAt)
            : undefined,
        },
        sessionId: hostSessionId,
        owner: {
          id: crypto.randomUUID(),
          sessionId: hostSessionId,
          name: session.ownerName ?? 'Host',
          isOwner: true,
        },
      });

      addMember({
        id: crypto.randomUUID(),
        sessionId: guestSessionId ?? undefined,
        name: displayName,
        isOwner: false,
        isReady: false,
      });
    }

    setInitialized(true);
  }

  function handleConfirmSwitch() {
    switchToSessionCart();
    setConflictOpen(false);
    setInitialized(true);
  }

  function handleCancelSwitch() {
    router.push('/restaurants');
  }

  function handleCopyCode() {
    if (!session) {
      return;
    }

    navigator.clipboard.writeText(session.code);
    toast.success('Group order code copied');
  }

  if (!session) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">Group order not found</h1>
        <p className="mt-2 text-muted-foreground">
          This session may have expired or does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurants">Browse restaurants</Link>
        </Button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">Restaurant not found</h1>
        <p className="mt-2 text-muted-foreground">
          The restaurant for this group order is unavailable.
        </p>
      </div>
    );
  }

  const activeCart = isCurrentSessionCart ? cart : null;
  const summary = getSummary();
  const cartItems = activeCart?.items ?? [];

  return (
    <>
      <div className="container mx-auto max-w-7xl space-y-8 py-8">
        <div className="flex items-start gap-4">
          {session.restaurantImage && (
            <div className="relative size-16 overflow-hidden rounded-xl">
              <Image
                src={session.restaurantImage}
                alt={session.restaurantName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">Group order</h1>
            <p className="mt-1 text-muted-foreground">
              {session.restaurantName}
              {session.groupName && ` · ${session.groupName}`}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Users className="size-3.5" />
                Code: {session.code}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2"
                onClick={handleCopyCode}>
                <Copy className="size-3.5" />
                Copy code
              </Button>
              <span className="capitalize text-muted-foreground">
                {session.type} session
              </span>
            </div>
          </div>
        </div>

        {activeCart && activeCart.members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Members</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {activeCart.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {(member.name ?? 'G')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name ?? 'Guest'}</span>
                  {member.isOwner && (
                    <span className="text-xs text-muted-foreground">
                      (Host)
                    </span>
                  )}
                  {!member.isOwner && member.isReady && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                      <Check className="size-3" />
                      Ready
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <RestaurantMenuView
              restaurant={restaurant}
              items={menuItems}
              showScannedMenu={false}
              orderingContext="group-order"
            />
          </div>

          <Card className="h-fit xl:sticky xl:top-20">
            <CardHeader>
              <CardTitle className="text-base">Group cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No items yet. Select from the menu to add items.
                </p>
              ) : (
                <GroupCartItemsList
                  items={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              )}

              <GroupCartTotals items={cartItems} summary={summary} />

              <GroupCartActionButton />
            </CardContent>
          </Card>
        </div>
      </div>

      <CartConflictDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        currentRestaurantName={cart?.restaurantName}
        newRestaurantName={session.restaurantName}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />
    </>
  );
}
