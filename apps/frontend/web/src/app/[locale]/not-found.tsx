'use client';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mx-auto bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <TriangleAlert className="text-muted-foreground h-8 w-8" />
          </div>

          <CardTitle className="text-4xl font-bold tracking-tight">
            404
          </CardTitle>

          <p className="text-muted-foreground mt-2 text-sm">{t('title')}</p>
        </CardHeader>

        <CardContent className="text-muted-foreground text-center text-sm">
          {t('description')}
        </CardContent>

        <CardFooter className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">{t('backToHome')}</Link>
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            {t('goBack')}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

