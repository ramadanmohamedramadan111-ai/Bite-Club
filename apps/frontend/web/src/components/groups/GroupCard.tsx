import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupTypeSimplified } from '@/types/groups';
import { Users } from 'lucide-react';

import GroupImage from './GroupImage';

type Props = {
  group: GroupTypeSimplified;
};

export default async function GroupCard({ group }: Props) {
  const t = await getTranslations('groups');

  return (
    <Link href={`/groups/${group.id}`} className="group cursor-pointer">
      <Card className="transition-all duration-300 hover:shadow-md hover:border-border/80 border border-border/40 p-4 h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center gap-3.5 p-0 pb-3">
          <GroupImage
            src={group.image_url}
            alt={group.name}
            className="size-12 rounded-xl object-cover shrink-0 border border-border/30"
            fallbackClassName="size-12 rounded-xl shrink-0 border border-border/30"
          />
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {group.name}
            </CardTitle>
            <p className="truncate text-xs text-muted-foreground mt-0.5 leading-normal">
              {group.description || 'No description available'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2 border-t border-border/30 mt-auto flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/60 px-2 py-0.5 text-muted-foreground font-semibold">
            <Users className="size-3.5" />
            <span>
              {group.members_count}{' '}
              {group.members_count !== 1 ? t('members_plural') : t('member')}
            </span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
