'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getRewardOfferById, useCartStore, usePointsStore } from '@/lib/const-data';
import {
  calculateOfferDiscount,
  isRedemptionActive,
} from '@/utils/cart-summary';

export default function CartRedemptionSelector() {
  const t = useTranslations('cartRedemption');
  const cart = useCartStore((state) => state.cart);
  const applyRedemption = useCartStore((state) => state.applyRedemption);
  const getSummary = useCartStore((state) => state.getSummary);
  const redemptions = usePointsStore((state) => state.redemptions);

  const summary = getSummary();

  const activeRedemptions = useMemo(
    () => redemptions.filter(isRedemptionActive),
    [redemptions],
  );

  if (!cart || cart.type !== 'individual') {
    return null;
  }

  const selectedId = cart.appliedRedemptionId ?? '';

  function handleSelect(value: string) {
    if (value === 'none') {
      applyRedemption(null);
      return;
    }

    const redemption = activeRedemptions.find((entry) => entry.id === value);

    if (!redemption) {
      toast.error(t('offerUnavailable'));
      applyRedemption(null);
      return;
    }

    const offer = getRewardOfferById(redemption.offerId);

    if (!offer) {
      toast.error(t('offerDetailsNotFound'));
      return;
    }

    const discount = calculateOfferDiscount(
      offer,
      summary.subtotal,
      summary.deliveryFee,
    );

    if (discount <= 0) {
      if (offer.minSubtotal) {
        toast.error(
          t('minimumOrderRequired', { amount: offer.minSubtotal }),
        );
      } else {
        toast.error(t('offerNotApplicable'));
      }
      return;
    }

    applyRedemption(value);
    toast.success(t('appliedOffer', { title: redemption.offerTitle }));
  }

  if (activeRedemptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {t('noActiveRedeems')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">{t('applyRedeem')}</p>
      </div>

      <RadioGroup value={selectedId || 'none'} onValueChange={handleSelect}>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="none" id="redeem-none" />
          <Label htmlFor="redeem-none" className="font-normal">
            {t('noRedeem')}
          </Label>
        </div>

        {activeRedemptions.map((redemption) => {
          const offer = getRewardOfferById(redemption.offerId);
          const discount =
            offer &&
            calculateOfferDiscount(
              offer,
              summary.subtotal,
              summary.deliveryFee,
            );
          const isEligible = Boolean(offer && discount && discount > 0);

          return (
            <div key={redemption.id} className="flex items-start gap-2">
              <RadioGroupItem
                value={redemption.id}
                id={`redeem-${redemption.id}`}
                disabled={!isEligible}
              />
              <Label
                htmlFor={`redeem-${redemption.id}`}
                className="font-normal leading-snug">
                <span className="font-medium">{redemption.offerTitle}</span>
                <span className="block text-xs text-muted-foreground">
                  {isEligible
                    ? t('saveUpTo', { amount: discount?.toFixed(2) })
                    : offer?.minSubtotal
                      ? t('requiresSubtotal', { amount: offer.minSubtotal })
                      : t('notEligible')}
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {selectedId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-0"
          onClick={() => applyRedemption(null)}>
          {t('removeRedeem')}
        </Button>
      )}
    </div>
  );
}

