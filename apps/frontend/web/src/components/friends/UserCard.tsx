import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import { FriendResponseType, FriendsTabType } from '@/types/friends';
import UserActions from './UserActions';

interface Props {
  user: FriendResponseType;
  tab: FriendsTabType;
}

export default function UserCard({ user, tab }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all duration-300 shadow-xs hover:border-border/75 hover:shadow-sm hover:bg-card/90">
      <Link
        href={`/users/${user.username}`}
        className="flex items-center gap-3.5 group cursor-pointer"
      >
        <Avatar className="size-11 rounded-full border border-border/30 shadow-xs">
          <AvatarImage src={user.profile_image ?? undefined} className="object-cover" />
          <AvatarFallback className="font-bold text-sm bg-accent text-accent-foreground">
            {user.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-0.5">
          <p className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary group-hover:underline transition-all leading-tight">
            {user.full_name}
          </p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </Link>

      <UserActions user={user} tab={tab} />
    </div>
  );
}
