'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-8">
      <AlertTriangle className="size-10 text-destructive" />
      <h2 className="text-xl font-semibold">{t('somethingWentWrong')}</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message}
      </p>
      <Button onClick={reset}>
        <RefreshCw className="mr-2 size-4" />
        {t('tryAgainButton')}
      </Button>
    </div>
  );
}
