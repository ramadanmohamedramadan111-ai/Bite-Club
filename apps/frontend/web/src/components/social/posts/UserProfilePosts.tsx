'use client';

import { useEffect, useMemo, useState } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '@/types/social/posts';
import { Loader2 } from 'lucide-react';
import { useSocialStore } from '@/stores/social';
import { useAddToIndividualCart } from '@/lib/const-data';
import { useTranslations } from 'next-intl';

interface UserProfilePostsProps {
  userId: string;
  onAddToCart?: (post: Post) => void;
}

const POSTS_PER_PAGE = 3;

export function UserProfilePosts({
  userId,
  onAddToCart,
}: UserProfilePostsProps) {
  const tc = useTranslations('common');
  const allPosts = useSocialStore((state) => state.posts);
  const { addFromPost, dialog } = useAddToIndividualCart();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  const userPosts = useMemo(
    () => allPosts.filter((post) => post.authorId === userId),
    [allPosts, userId],
  );
  const hasNextPage = posts.length < userPosts.length;

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(0);

    const timer = setTimeout(() => {
      setPosts(userPosts.slice(0, POSTS_PER_PAGE));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [userId, userPosts]);

  useEffect(() => {
    if (!observedElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !isFetchingNextPage &&
          !isLoading &&
          hasNextPage
        ) {
          setIsFetchingNextPage(true);
          setTimeout(() => {
            const nextPage = currentPage + 1;
            const startIdx = nextPage * POSTS_PER_PAGE;
            const newPosts = userPosts.slice(
              startIdx,
              startIdx + POSTS_PER_PAGE,
            );

            if (newPosts.length > 0) {
              setPosts((prev) => [...prev, ...newPosts]);
              setCurrentPage(nextPage);
            }
            setIsFetchingNextPage(false);
          }, 400);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [
    observedElement,
    isFetchingNextPage,
    isLoading,
    currentPage,
    userId,
    userPosts,
    hasNextPage,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">{tc('noPostsYet')}</p>
      </div>
    );
  }

  const handleAddToCart = (post: Post) => {
    if (onAddToCart) {
      onAddToCart(post);
      return;
    }

    addFromPost(post, { redirect: true });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {hasNextPage && (
          <div ref={setObservedElement} className="flex justify-center py-8">
            {isFetchingNextPage && <Loader2 className="animate-spin" />}
          </div>
        )}

        {!hasNextPage && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {tc('noMore')}
          </p>
        )}
      </div>
      {!onAddToCart && dialog}
    </>
  );
}
