import FeedHeader from '@/components/posts/FeedHeader';
import FeedTabsNav from '@/components/posts/FeedTabsNav';

export default async function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-6">
      <FeedHeader />
      <FeedTabsNav />
      {children}
    </div>
  );
}

