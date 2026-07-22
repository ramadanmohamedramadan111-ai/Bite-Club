'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Redemption } from '@/types/points/points';
import { formatPointsDate, redemptionStatusLabel } from './points-utils';
import { usePointsStore } from '@/lib/const-data';
import { toast } from 'sonner';

function statusStyles(status: Redemption['status']) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'used':
      return 'bg-secondary text-secondary-foreground';
    case 'expired':
      return 'bg-muted text-muted-foreground';
  }
}

type Props = {
  redemption: Redemption;
  showUseAction?: boolean;
};

export default function RedemptionCard({
  redemption,
  showUseAction = false,
}: Props) {
  const useRedemption = usePointsStore((state) => state.useRedemption);

  function handleUse() {
    useRedemption(redemption.id);
    toast.success('Redemption marked as used');
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{redemption.offerTitle}</p>
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                statusStyles(redemption.status),
              )}
            >
              {redemptionStatusLabel(redemption.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Code: <span className="font-mono">{redemption.code}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Redeemed {formatPointsDate(redemption.redeemedAt)} · Expires{' '}
            {formatPointsDate(redemption.expiresAt)}
          </p>
          {redemption.pointsSpent > 0 && (
            <p className="text-xs text-muted-foreground">
              {redemption.pointsSpent.toLocaleString()} points spent
            </p>
          )}
        </div>

        {showUseAction && redemption.status === 'active' && (
          <Button size="sm" variant="outline" onClick={handleUse}>
            Mark as used
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
