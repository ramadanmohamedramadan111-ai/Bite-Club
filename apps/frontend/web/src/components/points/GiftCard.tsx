'use client';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Gift } from '@/types/points/points';
import { formatPointsDate } from './points-utils';
import { usePointsStore } from '@/lib/const-data';

function giftStatusLabel(status: Gift['status'], direction: Gift['direction']) {
  if (direction === 'sent' && status === 'available') {
    return 'Sent';
  }

  switch (status) {
    case 'available':
      return 'Available';
    case 'claimed':
      return 'Claimed';
    case 'expired':
      return 'Expired';
  }
}

function giftStatusStyles(status: Gift['status']) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'claimed':
      return 'bg-secondary text-secondary-foreground';
    case 'expired':
      return 'bg-muted text-muted-foreground';
  }
}

type Props = {
  gift: Gift;
  showClaimAction?: boolean;
};

export default function GiftCard({ gift, showClaimAction = false }: Props) {
  const claimGift = usePointsStore((state) => state.claimGift);

  function handleClaim() {
    const result = claimGift(gift.id);

    if (!result.success) {
      toast.error(result.error ?? 'Failed to claim gift');
      return;
    }

    toast.success('Gift claimed! Added to your active redeems.');
  }

  const counterparty =
    gift.direction === 'received'
      ? `@${gift.fromUsername}`
      : `@${gift.toUsername}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{gift.offerTitle}</p>
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                giftStatusStyles(gift.status),
              )}
            >
              {giftStatusLabel(gift.status, gift.direction)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {gift.direction === 'received' ? 'From' : 'To'} {counterparty}
          </p>
          {gift.message && (
            <p className="text-sm italic text-muted-foreground">
              &quot;{gift.message}&quot;
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatPointsDate(gift.createdAt)} · Expires{' '}
            {formatPointsDate(gift.expiresAt)}
          </p>
          {gift.pointsCost > 0 && gift.direction === 'sent' && (
            <p className="text-xs text-muted-foreground">
              {gift.pointsCost.toLocaleString()} points spent
            </p>
          )}
        </div>

        {showClaimAction && gift.status === 'available' && (
          <Button size="sm" onClick={handleClaim}>
            Claim gift
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
