'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

import { useAuthStore } from '@/stores/auth';

type Props = {
  sessionId?: number;
  onCheckout?: () => void;
};

export default function GroupCartActionButton({ sessionId, onCheckout }: Props) {
  const tc = useTranslations('common');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full bg-gradient-to-r from-primary to-orange-600 text-white shadow-md hover:shadow-lg transition-all rounded-xl" size="lg">
        <Link href="/login" onClick={onCheckout}>
          {tc('loginToCheckout')}
        </Link>
      </Button>
    );
  }

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
