import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupTypeSimplified } from '@/types/groups/groups';

import GroupImage from './GroupImage';

type Props = {
  group: GroupTypeSimplified;
};

export default function GroupCard({ group }: Props) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <GroupImage
            src={group.image_url}
            alt={group.name}
            className="size-12 rounded-lg"
            fallbackClassName="size-12 rounded-lg"
          />
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{group.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {group.description}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {group.members_count} member
            {group.members_count !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

