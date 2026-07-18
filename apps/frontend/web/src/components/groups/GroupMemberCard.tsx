import { cn } from '@/lib/utils';
import { GroupMember, GroupType } from '@/types/groups/groups';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import GroupMemberActions from './GroupMemberActions';

type Props = {
  member: GroupMember;
  group: GroupType;
  type: 'me' | 'others';
};

export default function GroupMemberCard({ member, group, type }: Props) {
  const isMe = type === 'me';
  const isMemberOwner = member.role === 'owner';
  const isMemberAdmin = member.role === 'admin';

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-colors',
        isMe && 'border-primary bg-primary/5',
      )}>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.profile_image ?? undefined} />
          <AvatarFallback>{member.full_name}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{member.full_name}</p>

            {isMe && <Badge variant="secondary">You</Badge>}

            {isMemberOwner && <Badge variant="outline">Owner</Badge>}

            {isMemberAdmin && <Badge variant="outline">Admin</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">@{member.username}</p>
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

