'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '@/types/social/posts';
import { Loader2, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useSocialStore } from '@/stores/social';

interface ActivityFeedPageProps {
  onAddToCart?: (post: Post) => void;
}

type TabKey = 'following' | 'global';

type TabFeedState = {
  posts: Post[];
  page: number;
  isFetchingNextPage: boolean;
};

const POSTS_PER_PAGE = 6;

const EMPTY_TAB_STATE: TabFeedState = {
  posts: [],
  page: 0,
  isFetchingNextPage: false,
};

const POST_GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

function getTabPosts(
  tab: TabKey,
  allPosts: Post[],
  followingPosts: Post[],
) {
  return tab === 'following' ? followingPosts : allPosts;
}

export function ActivityFeedPage({ onAddToCart }: ActivityFeedPageProps) {
  const allPosts = useSocialStore((state) => state.posts);
  const users = useSocialStore((state) => state.users);

  const followingPosts = useMemo(() => {
    const followingIds = new Set(
      users
        .filter((user) => user.relationships.isFollowing)
        .map((user) => user.id),
    );

    return allPosts.filter((post) => followingIds.has(post.authorId));
  }, [allPosts, users]);

  const [activeTab, setActiveTab] = useState<TabKey>('following');
  const [feedByTab, setFeedByTab] = useState<Record<TabKey, TabFeedState>>({
    following: { ...EMPTY_TAB_STATE },
    global: { ...EMPTY_TAB_STATE },
  });

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  const postsCountRef = useRef(allPosts.length);

  const tabPosts = getTabPosts(activeTab, allPosts, followingPosts);

  const currentFeed = useMemo(() => {
    const cached = feedByTab[activeTab];
    if (cached.posts.length > 0) {
      return cached;
    }

    return {
      posts: tabPosts.slice(0, POSTS_PER_PAGE),
      page: 0,
      isFetchingNextPage: false,
    };
  }, [feedByTab, activeTab, tabPosts]);

  const hasMorePosts = currentFeed.posts.length < tabPosts.length;

  useEffect(() => {
    if (allPosts.length === postsCountRef.current) return;

    postsCountRef.current = allPosts.length;

    setFeedByTab((prev) => ({
      following: {
        ...prev.following,
        posts: getTabPosts(
          'following',
          allPosts,
          followingPosts,
        ).slice(0, (prev.following.page + 1) * POSTS_PER_PAGE),
      },
      global: {
        ...prev.global,
        posts: allPosts.slice(0, (prev.global.page + 1) * POSTS_PER_PAGE),
      },
    }));
  }, [allPosts, followingPosts]);

  useEffect(() => {
    if (!observedElement || !hasMorePosts) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setFeedByTab((prev) => {
        const source = getTabPosts(activeTab, allPosts, followingPosts);
        const tabState =
          prev[activeTab].posts.length > 0
            ? prev[activeTab]
            : {
                posts: source.slice(0, POSTS_PER_PAGE),
                page: 0,
                isFetchingNextPage: false,
              };

        if (tabState.isFetchingNextPage) return prev;

        const nextPage = tabState.page + 1;
        const startIdx = nextPage * POSTS_PER_PAGE;
        const newPostsSlice = source.slice(startIdx, startIdx + POSTS_PER_PAGE);

        if (newPostsSlice.length === 0) return prev;

        return {
          ...prev,
          [activeTab]: {
            posts: [...tabState.posts, ...newPostsSlice],
            page: nextPage,
            isFetchingNextPage: false,
          },
        };
      });
    }, { threshold: 0.1 });

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, hasMorePosts, activeTab, allPosts, followingPosts]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="mt-2 text-muted-foreground">
            See what your friends are ordering and share your own meals.
          </p>
        </div>
        <Link href="/feed/create">
          <Button size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {currentFeed.posts.length > 0 ? (
            <div className={POST_GRID_CLASS}>
              {currentFeed.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No posts yet. Follow friends to see their posts!
            </p>
          )}

          {hasMorePosts && (
            <div ref={setObservedElement} className="flex justify-center py-8">
              {currentFeed.isFetchingNextPage && (
                <Loader2 className="animate-spin" />
              )}
            </div>
          )}

          {!hasMorePosts && currentFeed.posts.length > 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No more posts to load
            </p>
          )}
        </div>
      </Tabs>
    </div>
  );
}
