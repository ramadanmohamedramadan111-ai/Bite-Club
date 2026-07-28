'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PointsTab } from '@/types/points';

const tabKeys: { value: PointsTab; labelKey: string }[] = [
  { value: 'history', labelKey: 'history' },
  { value: 'referrals', labelKey: 'referrals' },
];

export default function PointsTabs() {
  const t = useTranslations('points');
  const pathname = usePathname();

  const activeTab =
    tabKeys.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ??
    'history';

  return (
    <Tabs value={activeTab}>
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        {tabKeys.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={`/points/${tab.value}`}>{t(tab.labelKey)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

