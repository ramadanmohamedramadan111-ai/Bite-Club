'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import SendGiftDialog from './SendGiftDialog';
import type { RewardOffer } from '@/types/points/points';
import { usePointsStore } from '@/stores/points';

type Props = {
  offer: RewardOffer;
};

export default function RewardOfferCard({ offer }: Props) {
  const pointsBalance = usePointsStore((state) => state.pointsBalance);
  const redeemOffer = usePointsStore((state) => state.redeemOffer);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  const canAfford = pointsBalance >= offer.pointsCost;

  function handleRedeem() {
    const result = redeemOffer(offer.id);

    if (!result.success) {
      toast.error(result.error ?? 'Failed to redeem offer');
      return;
    }

    toast.success('Offer redeemed! Check your active redeems.');
    setRedeemOpen(false);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative h-36 w-full">
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            className="object-cover"
          />
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {offer.discountLabel}
          </span>
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <h3 className="font-semibold">{offer.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {offer.description}
            </p>
          </div>
          <p className="flex items-center gap-1 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            {offer.pointsCost.toLocaleString()} points
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              disabled={!canAfford}
              onClick={() => setRedeemOpen(true)}
            >
              Redeem
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={!canAfford}
              onClick={() => setGiftOpen(true)}
            >
              <Gift className="mr-1.5 h-4 w-4" />
              Send gift
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        title="Redeem this offer?"
        description={`This will spend ${offer.pointsCost.toLocaleString()} points to redeem "${offer.title}".`}
        confirmText="Redeem"
        onConfirm={handleRedeem}
      />

      <SendGiftDialog
        open={giftOpen}
        onOpenChange={setGiftOpen}
        offer={offer}
      />
    </>
  );
}
