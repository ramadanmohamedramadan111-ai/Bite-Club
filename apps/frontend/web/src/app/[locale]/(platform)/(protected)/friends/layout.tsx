import FriendsTabsNavigation from '@/components/friends/FriendsTabsNavigation';
import SearchUsers from '@/components/friends/SearchUsers';

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FriendsTabsNavigation />
      <SearchUsers />
      {children}
    </>
  );
}

