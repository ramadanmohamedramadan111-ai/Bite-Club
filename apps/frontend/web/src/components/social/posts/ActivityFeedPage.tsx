'use client';

import { useEffect, useState } from 'react';
import { PostCard } from './PostCard';
import { Post } from '@/types/social/posts';
import { Loader2, Plus } from 'lucide-react';
import { mockPosts } from '@/data/mock-posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CreatePostDialog } from './CreatePostDialog';

interface ActivityFeedPageProps {
  onAddToCart?: (post: Post) => void;
}

export function ActivityFeedPage({ onAddToCart }: ActivityFeedPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'following' | 'global'>('following');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const postsPerPage = 3;

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  // Separate posts by type
  const followingPosts = mockPosts.slice(0, 4); // Mock following posts
  const globalPosts = mockPosts; // All posts are global

  // Get current tab posts
  const tabPosts = activeTab === 'following' ? followingPosts : globalPosts;

  // Simulate initial load
  useEffect(() => {
    setTimeout(() => {
      setPosts(tabPosts.slice(0, postsPerPage));
      setIsLoading(false);
      setCurrentPage(0);
    }, 500);
  }, [activeTab, tabPosts]);

  // Simulate infinite scroll
  useEffect(() => {
    if (!observedElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage && !isLoading) {
          const nextPage = currentPage + 1;
          const startIdx = nextPage * postsPerPage;
          const newPostsSlice = tabPosts.slice(startIdx, startIdx + postsPerPage);

          // Only fetch if there are more posts available
          if (newPostsSlice.length > 0) {
            setIsFetchingNextPage(true);
            setTimeout(() => {
              setPosts((prev) => [...prev, ...newPostsSlice]);
              setCurrentPage(nextPage);
              setIsFetchingNextPage(false);
            }, 600);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, isFetchingNextPage, isLoading, currentPage, tabPosts]);

  const hasMorePosts = posts.length < tabPosts.length;

  const handleCreatePost = async (postData: { restaurantId: string; caption: string; image?: string }) => {
    // Add new post to the list
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: 'current-user',
      author: {
        id: 'current-user',
        name: 'Your Name',
        username: 'currentuser',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      },
      restaurantId: postData.restaurantId,
      restaurant: {
        id: postData.restaurantId,
        name: 'Restaurant Name',
        address: 'Restaurant Address',
        image:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
      },
      items: [],
      caption: postData.caption,
      image: postData.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop',
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with create button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        <Button
          size="icon"
          onClick={() => setOpenCreateDialog(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'following' | 'global')} className="mb-6">
        <TabsList>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onAddToCart={onAddToCart} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="global">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onAddToCart={onAddToCart} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Infinite scroll trigger */}
      <div ref={setObservedElement} className="py-8 flex justify-center">
        {isFetchingNextPage && <Loader2 className="animate-spin" />}
      </div>

      {!hasMorePosts && posts.length > 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No more posts to load
        </div>
      )}

      {posts.length === 0 && !isLoading && (
        <div className="py-12 text-center text-muted-foreground">
          No posts yet. Follow friends to see their posts!
        </div>
      )}

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
