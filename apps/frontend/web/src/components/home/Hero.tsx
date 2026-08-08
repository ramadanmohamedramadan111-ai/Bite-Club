'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import { Flame, Sparkles } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home');
  const locale = useLocale();

  const handleOpenAiChat = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chat'));
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/10 via-background to-orange-500/5 px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:px-16 shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-12">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-orange-500/5 blur-[100px] rounded-full -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6 lg:col-span-7 text-start max-w-2xl">
          {/* Tagline Badge */}

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1] text-foreground text-start">
            {locale === 'ar'
              ? 'اطلب طعاماً ستحبه مع مساعدنا الذكي'
              : 'Order food you’ll love with our AI assistant'}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed text-start">
            {locale === 'ar'
              ? 'اكتشف أفضل المطاعم القريبة منك، واطلب مع أصدقائك، وجرب مساعد الذكاء الاصطناعي للحصول على توصيات وتجربة طلب ممتعة وسريعة!'
              : 'Discover top restaurants, order with friends, and try out our smart AI Food Assistant to get personalized dish suggestions instantly!'}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Button
              onClick={handleOpenAiChat}
              size="lg"
              className="h-11 sm:h-12 px-6 rounded-xl text-base shadow-lg shadow-primary/15 bg-gradient-to-r from-primary to-orange-500 hover:from-primary hover:to-orange-600 border-0 text-white cursor-pointer font-bold gap-2">
              <Sparkles className="size-4 animate-pulse" />
              <span>
                {locale === 'ar' ? 'جرب المساعد الذكي' : 'Try AI Assistant'}
              </span>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 sm:h-12 px-6 rounded-xl text-base cursor-pointer font-semibold border-border hover:bg-accent/40 shadow-3xs">
              <Link href="/restaurants">{t('heroCta')}</Link>
            </Button>
          </div>
        </div>

        {/* Right Column: Hero Logo Showcase */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-full aspect-video sm:aspect-[4/3] lg:aspect-square rounded-2xl sm:rounded-3xl border border-border/40 shadow-xl bg-gradient-to-br from-primary/10 via-card to-orange-500/5 hover:scale-[1.01] transition-transform duration-300 flex flex-col items-center justify-center gap-4 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 blur-2xl rounded-full pointer-events-none" />
            <div className="flex size-24 items-center justify-center rounded-3xl overflow-hidden animate-pulse">
              <img src="/logo.png" alt="Bite Club Logo" className="size-full object-cover select-none" />
            </div>
            <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent select-none">
              BiteClub
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

