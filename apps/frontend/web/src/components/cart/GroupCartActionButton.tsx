'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type Props = {
  sessionId?: number;
  onCheckout?: () => void;
};

export default function GroupCartActionButton({ sessionId, onCheckout }: Props) {
  const tc = useTranslations('common');

  if (sessionId) {
    return (
      <Button asChild className="w-full" size="lg">
        <Link href={`/group-order/${sessionId}/checkout`}>
          {tc('proceedToCheckout')}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className="w-full" size="lg">
      <Link href="/checkout" onClick={onCheckout}>
        {tc('proceedToCheckout')}
      </Link>
    </Button>
  );
}
