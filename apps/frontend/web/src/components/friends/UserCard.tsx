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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all duration-300 shadow-xs hover:border-border/75 hover:shadow-sm hover:bg-card/90 gap-4">
      <Link
        href={`/users/${user.username}`}
        className="flex items-center gap-3.5 group cursor-pointer min-w-0"
      >
        <Avatar className="size-11 rounded-full border border-border/30 shadow-xs shrink-0">
          <AvatarImage src={user.profile_image ?? undefined} className="object-cover" />
          <AvatarFallback className="font-bold text-sm bg-accent text-accent-foreground">
            {user.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-0.5 min-w-0">
          <p className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary group-hover:underline transition-all leading-tight truncate">
            {user.full_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>
      </Link>

      <div className="w-full sm:w-auto flex items-center justify-end border-t border-border/10 pt-3 sm:border-t-0 sm:pt-0">
        <UserActions user={user} tab={tab} />
      </div>
    </div>
  );
}
