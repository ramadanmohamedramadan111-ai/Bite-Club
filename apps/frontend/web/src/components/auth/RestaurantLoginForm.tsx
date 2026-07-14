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
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>

          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Link
            href="http://dashboard.biteclub.test:8080"
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t('dashboardLink.text')}
          </Link>

          <Link
            href="/restaurant-register"
            className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            {t('registerLink.text')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
