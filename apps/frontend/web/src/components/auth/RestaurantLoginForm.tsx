'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Link } from '@/i18n/navigation';

export default function RestaurantLoginForm({
  className,
}: React.ComponentProps<'div'>) {
  const t = useTranslations('forms.loginRestaurant');

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className="rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3.5">
          <Link
            href="http://dashboard.biteclub.test:8080"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/95 shadow-sm transition-colors duration-200">
            {t('dashboardLink.text')}
          </Link>

          <Link
            href="/restaurant-register"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-bold text-foreground hover:bg-accent/40 hover:text-foreground shadow-3xs transition-colors duration-200">
            {t('registerLink.text')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
