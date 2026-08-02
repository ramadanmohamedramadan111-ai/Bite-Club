'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GroupTab } from '@/types/groups';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  groupId: number;
};

export default function GroupTabs({ groupId }: Props) {
  const t = useTranslations('groups');
  const router = useRouter();
  const pathname = usePathname();

  const lastSegment = pathname.split('/').pop();
  const activeTab: GroupTab = (lastSegment === 'history' || lastSegment === 'settings') ? lastSegment : 'members';

  const tabs: { value: GroupTab; label: React.ReactNode }[] = [
    { value: 'members', label: t('members') },
    { value: 'history', label: t('history') },
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <Tabs value={activeTab}>
        <TabsList className="grid w-full grid-cols-2 w-[240px] sm:w-[280px]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => {
                const url = tab.value === 'members'
                  ? `/groups/${groupId}`
                  : `/groups/${groupId}/${tab.value}`;
                router.push(url);
              }}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
        size="icon"
        className={cn(
          "rounded-xl shrink-0 cursor-pointer",
          activeTab === 'settings' && "bg-accent text-foreground border border-border/50"
        )}
        onClick={() => router.push(`/groups/${groupId}/settings`)}
        aria-label={t('settings')}
      >
        <Settings className={cn("size-5 transition-transform duration-300", activeTab === 'settings' && "rotate-45 text-primary")} />
      </Button>
    </div>
  );
}

