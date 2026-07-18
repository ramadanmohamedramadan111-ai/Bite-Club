'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations('errors');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">{t('somethingWentWrong')}</h2>

      <Button onClick={reset}>{t('tryAgain')}</Button>
    </div>
  );
}

