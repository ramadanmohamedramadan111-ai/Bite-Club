'use client';

import { useTranslations } from 'next-intl';
import type { CartSummary } from '@/lib/const-data';
import { Separator } from '@/components/ui/separator';

type Props = {
  summary: CartSummary;
};

export default function CartTotals({ summary }: Props) {
  const t = useTranslations('common');
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('subtotal')}</span>
        <span>{summary.subtotal.toFixed(2)} {t('egp')}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('deliveryFee')}</span>
        <span>{summary.deliveryFee.toFixed(2)} {t('egp')}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('tax')}</span>
        <span>{summary.tax.toFixed(2)} {t('egp')}</span>
      </div>
      {summary.discount > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t('discount')}
            {summary.appliedRedemptionTitle
              ? ` (${summary.appliedRedemptionTitle})`
              : ''}
          </span>
          <span>-{summary.discount.toFixed(2)} {t('egp')}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between text-base font-semibold">
        <span>{t('total')}</span>
        <span>{summary.total.toFixed(2)} {t('egp')}</span>
      </div>
    </div>
  );
}

