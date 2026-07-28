'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Bold, Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('sidebar');
  const locale = useLocale();

  const exploreLinks = [
    { name: t('home'), url: '/' },
    { name: t('restaurants'), url: '/restaurants' },
    { name: t('feed'), url: '/feed' },
  ];

  const communityLinks = [
    { name: t('groups'), url: '/groups' },
    { name: t('friends'), url: '/friends' },
    { name: t('points'), url: '/points' },
  ];

  const platformLinks = [
    { name: t('settings'), url: '/settings' },
    { name: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service', url: '#' },
    { name: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', url: '#' },
  ];

  return (
    <footer className="relative w-full border-t border-border/80 bg-linear-to-b from-card via-primary/5 to-orange-500/10 transition-all duration-300">
      
      {/* Top glowing separator border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pt-16 pb-8">
        
        {/* Top Grid section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/40">
          
          {/* Col 1: Branding block */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5 w-fit"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-600 text-primary-foreground shadow-sm">
                <Bold className="size-4" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                BiteClub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground/90 max-w-sm leading-relaxed">
              {locale === 'ar' ? 
                'بايت كلوب يسهل طلب الطعام مع الأصدقاء والعائلة. شارك الروابط واجمع المكافآت وقسم الفاتورة بكل سهولة.' : 
                'BiteClub makes ordering food with friends, colleagues, and family super easy and collaborative. Share order links, earn rewards, and split bills seamlessly.'
              }
            </p>
            
            {/* Branded Color Rich Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#" 
                className="flex size-8 items-center justify-center rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 shadow-3xs" 
                aria-label="Facebook"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V2h-3c-2.5 0-5 1.5-5 4v2z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="flex size-8 items-center justify-center rounded-lg border border-[#ee2a7b]/20 bg-gradient-to-tr from-[#f9ce34]/15 via-[#ee2a7b]/15 to-[#6228d7]/15 text-[#ee2a7b] hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent transition-all duration-300 shadow-3xs" 
                aria-label="Instagram"
              >
                <svg className="size-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a 
                href="#" 
                className="flex size-8 items-center justify-center rounded-lg border border-foreground/20 bg-foreground/10 text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-3xs" 
                aria-label="Twitter"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.2 2.4h3.3L14.3 11l8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.3 2.4H8l4.7 6.3 5.5-6.3zm-1.2 17.6h1.8L7.1 4H5.2l11.8 16z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="flex size-8 items-center justify-center rounded-lg border border-[#24292e]/25 bg-[#24292e]/10 text-[#24292e] hover:bg-[#24292e] hover:text-white hover:border-[#24292e] transition-all duration-300 shadow-3xs" 
                aria-label="Github"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.5-4.5-10-10-10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Discover Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              {locale === 'ar' ? 'اكتشف' : 'Discover'}
            </h4>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.url}>
                  <Link 
                    href={link.url} 
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Community Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              {locale === 'ar' ? 'المجتمع' : 'Community'}
            </h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.url}>
                  <Link 
                    href={link.url} 
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              {locale === 'ar' ? 'المنصة' : 'Platform'}
            </h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.url} 
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>© 2026 BiteClub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="size-3 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by BiteClub Team</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
