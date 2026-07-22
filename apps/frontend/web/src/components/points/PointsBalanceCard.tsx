'use client';

import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePointsStore } from '@/lib/const-data';

export default function PointsBalanceCard() {
  const pointsBalance = usePointsStore((state) => state.pointsBalance);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Coins className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Your points balance</p>
          <p className="text-3xl font-bold">{pointsBalance.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
