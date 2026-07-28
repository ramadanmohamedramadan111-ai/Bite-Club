import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { GroupMember, GroupType } from '@/types/groups';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import GroupMemberActions from './GroupMemberActions';

type Props = {
  member: GroupMember;
  group: GroupType;
  type: 'me' | 'others';
};

export default async function GroupMemberCard({ member, group, type }: Props) {
  const t = await getTranslations('groups');
  const isMe = type === 'me';
  const isMemberOwner = member.role === 'owner';
  const isMemberAdmin = member.role === 'admin';

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all duration-300 shadow-xs hover:border-border/75 hover:shadow-sm',
        isMe && 'border-primary/40 bg-primary/5 hover:border-primary/60',
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-11 rounded-full border border-border/30 shadow-xs">
          <AvatarImage src={member.profile_image ?? undefined} className="object-cover" />
          <AvatarFallback className="font-bold text-sm bg-accent text-accent-foreground">
            {member.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-foreground leading-tight">{member.full_name}</span>

            {isMe && (
              <Badge className="bg-primary/10 border-primary/20 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {t('you')}
              </Badge>
            )}

            {isMemberOwner && (
              <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {t('owner')}
              </Badge>
            )}

            {isMemberAdmin && (
              <Badge className="bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {t('admin')}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">@{member.username}</p>
        </div>
      </div>

      {!isMe && (
        <GroupMemberActions
          currentUserRole={group.my_role}
          targetRole={member.role}
          groupId={group.id}
          memberId={member.id}
        />
      )}
    </div>
  );
}
