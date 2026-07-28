'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GroupTab } from '@/types/groups';
import { Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
  groupId: number;
};

export default function GroupTabs({ groupId }: Props) {
  const t = useTranslations('groups');
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.split('/').pop() as GroupTab;

  const tabs: { value: GroupTab; label: string }[] = [
    { value: 'members', label: t('members') },
    { value: 'history', label: t('history') },
  ];

  const isSettingsActive = activeTab === 'settings';

  return (
    <div className="flex items-center justify-between gap-4 select-none">
      <Tabs value={isSettingsActive ? undefined : activeTab} className="w-auto">
        <TabsList className="grid grid-cols-2 gap-2 bg-muted/45 border border-border/40 p-1.5 rounded-2xl h-auto w-64">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl py-2 px-4 text-sm font-bold transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/groups/${groupId}/${tab.value}`)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Link 
        href={`/groups/${groupId}/settings`}
        className="cursor-pointer"
      >
        <Button
          variant={isSettingsActive ? 'secondary' : 'outline'}
          size="icon"
          className={cn(
            "rounded-xl border shadow-3xs cursor-pointer h-10 w-10 transition-all duration-300",
            isSettingsActive 
              ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" 
              : "border-border/60 bg-background/50 hover:bg-accent/40 text-muted-foreground hover:text-foreground"
          )}
          title={t('settings')}
        >
          <Settings className="size-4.5 animate-spin-slow" />
        </Button>
      </Link>
    </div>
  );
}
