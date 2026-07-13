import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';

import { FriendsTab, SocialUser } from '@/types/social/friends';

import UserActions from './UserActions';

interface Props {
  user: SocialUser;

  tab: FriendsTab;
}

export default function UserCard({ user, tab }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <Link href={`/users/${user.username}`} className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-medium hover:underline">{user.name}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </Link>

      <UserActions user={user} tab={tab} />
    </div>
  );
}
