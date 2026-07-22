'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Gift } from '@/types/points/points';
import { formatPointsDate } from './points-utils';
import { usePointsStore } from '@/lib/const-data';

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
  const t = useTranslations('points');
  const claimGift = usePointsStore((state) => state.claimGift);

  function handleClaim() {
    const result = claimGift(gift.id);

    if (!result.success) {
      toast.error(result.error ?? t('giftClaimFailed'));
      return;
    }

    toast.success(t('giftClaimed'));
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
              {gift.direction === 'sent' && gift.status === 'available' ? t('sent') : t(gift.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {gift.direction === 'received' ? t('from') : t('to')} {counterparty}
          </p>
          {gift.message && (
            <p className="text-sm italic text-muted-foreground">
              &quot;{gift.message}&quot;
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatPointsDate(gift.createdAt)} · {t('expires')}{' '}
            {formatPointsDate(gift.expiresAt)}
          </p>
          {gift.pointsCost > 0 && gift.direction === 'sent' && (
            <p className="text-xs text-muted-foreground">
              {gift.pointsCost.toLocaleString()} {t('pointsSpent')}
            </p>
          )}
        </div>

        {showClaimAction && gift.status === 'available' && (
          <Button size="sm" onClick={handleClaim}>
            {t('claimGift')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
