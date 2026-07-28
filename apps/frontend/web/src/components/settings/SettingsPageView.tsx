'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function SettingsPageView() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings');

  const themeOptions = [
    { value: 'light', label: t('light'), icon: Sun },
    { value: 'dark', label: t('dark'), icon: Moon },
    { value: 'system', label: t('system'), icon: Monitor },
  ] as const;

  const languageOptions = [
    { value: 'en', label: t('english') },
    { value: 'ar', label: t('arabic') },
  ] as const;

  function changeLanguage(newLocale: 'en' | 'ar') {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="container mx-auto space-y-8">
      {/* Title & Description Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Theme Card Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t('theme')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme ?? 'system'}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const id = `theme-${option.value}`;
              const isSelected = (theme ?? 'system') === option.value;

              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={id}
                    className={cn(
                      'flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 text-center cursor-pointer transition-all duration-300 select-none hover:bg-accent/40 font-semibold',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}>
                    <Icon
                      className={cn(
                        'size-6',
                        isSelected ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="text-xs sm:text-sm">{option.label}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Language Card Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">{t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={locale}
            onValueChange={(value) => changeLanguage(value as 'en' | 'ar')}
            className="grid grid-cols-2 gap-4">
            {languageOptions.map((option) => {
              const id = `language-${option.value}`;
              const isSelected = locale === option.value;

              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={id}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center cursor-pointer transition-all duration-300 select-none hover:bg-accent/40 font-semibold',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}>
                    <span className="text-lg font-bold">
                      {option.value === 'ar' ? 'عربي' : 'EN'}
                    </span>
                    <span className="text-xs sm:text-sm">{option.label}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}

