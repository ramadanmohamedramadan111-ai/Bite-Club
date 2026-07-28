'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations('errors');
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background bg-dot-pattern">
      <Card className="w-full max-w-md border border-border shadow-md">
        <CardContent className="pt-8 pb-10 px-6 sm:px-8 text-center flex flex-col items-center">
          
          {/* Icon badge */}
          <div className="flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-2xs">
            <AlertTriangle className="size-8" />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {t('somethingWentWrong')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
            An unexpected error occurred while processing your request. Please try again.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-11 font-bold text-sm border-border cursor-pointer shadow-xs"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 size-4 text-muted-foreground" />
              {t('goHome') || 'Home'}
            </Button>
            
            <Button 
              className="flex-1 rounded-xl h-11 font-bold text-sm cursor-pointer shadow-xs"
              onClick={reset}
            >
              <RefreshCw className="mr-2 size-4" />
              {t('tryAgain') || 'Retry'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
