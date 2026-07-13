'use client';

import { Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
import { useGroupSessionsStore } from '@/stores/group-sessions';
import { useSessionStore } from '@/stores/session';
import { isGroupSessionOwner } from '@/utils/group-order';

type Props = {
  onCheckout?: () => void;
};

export default function GroupCartActionButton({ onCheckout }: Props) {
  const cart = useCartStore((state) => state.cart);
  const setMemberReady = useCartStore((state) => state.setMemberReady);
  const guestSessionId = useSessionStore((state) => state.sessionId);
  const session = useGroupSessionsStore((state) =>
    cart?.type === 'group'
      ? state.sessions.find((entry) => entry.id === cart.groupSession.id)
      : undefined,
  );

  if (!cart || cart.type !== 'group') {
    return (
      <Button asChild className="w-full" size="lg">
        <Link href="/checkout" onClick={onCheckout}>
          Proceed to checkout
        </Link>
      </Button>
    );
  }

  const currentMember = cart.members.find(
    (member) => member.sessionId === guestSessionId,
  );
  const isReady = currentMember?.isReady ?? false;
  const isOwner =
    isGroupSessionOwner(
      cart.groupSession.id,
      guestSessionId,
      session?.ownerSessionId,
    ) || currentMember?.isOwner === true;

  if (isOwner) {
    return (
      <Button asChild className="w-full" size="lg" disabled={cart.items.length === 0}>
        <Link href="/checkout" onClick={onCheckout}>
          Proceed to checkout
        </Link>
      </Button>
    );
  }

  function handleMarkReady() {
    if (!currentMember) {
      return;
    }

    setMemberReady(currentMember.id, true);
    toast.success("You're ready! Waiting for the host to checkout.");
  }

  return (
    <Button
      className="w-full gap-2"
      size="lg"
      variant={isReady ? 'outline' : 'default'}
      disabled={isReady}
      onClick={handleMarkReady}>
      {isReady ? (
        <>
          <Check className="size-4" />
          You&apos;re ready
        </>
      ) : (
        "I'm ready"
      )}
    </Button>
  );
}
