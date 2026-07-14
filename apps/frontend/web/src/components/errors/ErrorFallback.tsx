'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const t = useTranslations('errors');
  const message =
    error instanceof Error ? error.message : t('somethingWentWrong');

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold">{t('somethingWentWrong')}</h2>

      <p className="text-sm text-muted-foreground">{message}</p>

      <Button onClick={resetErrorBoundary}>{t('tryAgain')}</Button>
    </div>
  );
}

