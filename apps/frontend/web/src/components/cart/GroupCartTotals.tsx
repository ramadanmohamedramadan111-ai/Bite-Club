'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import type { GroupOrderCartSession } from '@/types/group-order/group-order';

type Props = {
  membersSummary: GroupOrderCartSession['members_summary'];
  totalAmount: number;
};

export default function GroupCartTotals({
  membersSummary,
  totalAmount,
}: Props) {
  const t = useTranslations('common');

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-2">
        <p className="font-medium">{t('byMember')}</p>
        {membersSummary.map((member) => (
          <div key={member.user.id} className="flex justify-between">
            <span className="text-muted-foreground">
              {member.user.name}
            </span>
            <span>
              {member.user_total.toFixed(2)} {t('egp')}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-between text-base font-semibold">
        <span>{t('total')}</span>
        <span>
          {totalAmount.toFixed(2)} {t('egp')}
        </span>
      </div>
    </div>
  );
}
