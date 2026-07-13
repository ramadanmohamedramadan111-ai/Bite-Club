import { FriendsTab, SocialUser } from '@/types/social/friends';

import UserCard from './UserCard';

interface Props {
  users: SocialUser[];

  tab: FriendsTab;
}

export default function UserList({ users, tab }: Props) {
  if (!users.length) {
    return (
      <div
        className="
          py-10
          text-center
          text-muted-foreground
        ">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} tab={tab} />
      ))}
    </div>
  );
}

