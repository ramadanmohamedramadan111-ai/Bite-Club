import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';

import { FriendResponseType, FriendsTabType } from '@/types/social/friends';

import UserActions from './UserActions';

interface Props {
  user: FriendResponseType;

  tab: FriendsTabType;
}

export default function UserCard({ user, tab }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <Link
        href={`/users/${user.username}`}
        className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.profile_image ?? undefined} />
          <AvatarFallback>{user.full_name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-medium hover:underline">{user.full_name}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </Link>

      <UserActions user={user} tab={tab} />
    </div>
  );
}

