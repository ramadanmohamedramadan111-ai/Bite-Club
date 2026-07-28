import FeedHeader from '@/components/posts/FeedHeader';
import FeedTabsNav from '@/components/posts/FeedTabsNav';

export default async function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto space-y-8">
      <FeedHeader />
      <FeedTabsNav />
      {children}
    </div>
  );
}

