'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const router = useRouter();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <div className="w-full max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border bg-destructive/10">
          <AlertTriangle className="size-10 text-destructive" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">{error.message}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('somethingWentWrong')}
        </p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="mr-2 size-4" />
            {t('goHome')}
          </Button>

          <Button onClick={reset}>
            <RefreshCw className="mr-2 size-4" />
            {t('tryAgainButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
