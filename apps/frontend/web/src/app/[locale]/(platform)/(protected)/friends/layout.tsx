import FriendsTabsNavigation from '@/components/social/friends/FriendsTabsNavigation';
import SearchUsers from '@/components/social/friends/SearchUsers';

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
