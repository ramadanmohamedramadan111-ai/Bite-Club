'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
] as const;

export default function SettingsPageView() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function changeLanguage(newLocale: 'en' | 'ar') {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Customize your app appearance and language.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme ?? 'system'}
            onValueChange={setTheme}
            className="space-y-3"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const id = `theme-${option.value}`;

              return (
                <div key={option.value} className="flex items-center gap-3">
                  <RadioGroupItem value={option.value} id={id} />
                  <Label
                    htmlFor={id}
                    className="flex flex-1 cursor-pointer items-center gap-2 font-normal"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Language</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={locale}
            onValueChange={(value) => changeLanguage(value as 'en' | 'ar')}
            className="space-y-3"
          >
            {languageOptions.map((option) => {
              const id = `language-${option.value}`;

              return (
                <div key={option.value} className="flex items-center gap-3">
                  <RadioGroupItem value={option.value} id={id} />
                  <Label htmlFor={id} className="cursor-pointer font-normal">
                    {option.label}
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
