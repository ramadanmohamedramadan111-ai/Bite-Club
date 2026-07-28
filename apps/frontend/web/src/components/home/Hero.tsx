import { getTranslations, getLocale } from 'next-intl/server';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Star, ShieldCheck, Flame } from 'lucide-react';

export default async function Hero() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/10 via-background to-orange-500/5 px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:px-16 shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-12">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-orange-500/5 blur-[100px] rounded-full -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6 lg:col-span-7 text-left max-w-2xl">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
            <Flame className="size-3.5 fill-current" />
            <span>
              {locale === 'ar' ? 'أفضل طعام في المدينة' : 'Best food in town'}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1] text-foreground">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-11 sm:h-12 px-6 rounded-xl text-base shadow-lg shadow-primary/10 cursor-pointer">
              <Link href="/restaurants">{t('heroCta')}</Link>
            </Button>
          </div>
        </div>

        {/* Right Column: Hero Image Showcase */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full aspect-video sm:aspect-[4/3] lg:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-border/40 shadow-xl bg-card hover:scale-[1.01] transition-transform duration-300">
            <Image
              src="/delicious_food_hero.jpg"
              alt="Delicious gourmet food selection"
              fill
              className="object-cover"
              sizes="(max-w-720px) 100vw, 500px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

