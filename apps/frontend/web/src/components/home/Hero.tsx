import { getTranslations } from 'next-intl/server';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';

export default async function Hero() {
  const t = await getTranslations('home');

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-background to-primary/5 px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('heroSubtitle')}
        </p>
        <Button asChild size="lg">
          <Link href="/restaurants">{t('heroCta')}</Link>
        </Button>
      </div>
    </section>
  );
}

