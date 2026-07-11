'use client';

import { useEffect, useMemo, useState } from 'react';
import { PostCard } from './PostCard';
import { Post, PostItem } from '@/types/social/posts';
import { CartItem } from '@/types/cart/cart';
import { Loader2 } from 'lucide-react';
import { useSocialStore } from '@/stores/social';

interface UserProfilePostsProps {
  userId: string;
  onAddToCart?: (post: Post) => void;
}

const POSTS_PER_PAGE = 3;

const convertPostItemToCartItem = (postItem: PostItem): CartItem => ({
  cartItemId: `cart-${postItem.id}-${Date.now()}`,
  itemId: postItem.id,
  name: postItem.name,
  quantity: postItem.quantity,
  basePrice: postItem.price,
  unitPrice: postItem.price,
  totalPrice: postItem.price * postItem.quantity,
  configurationKey: postItem.id,
  selectedOptions: [],
});

export function UserProfilePosts({
  userId,
  onAddToCart,
}: UserProfilePostsProps) {
  const allPosts = useSocialStore((state) => state.posts);

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
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  const handleAddToCartLocal = async (post: Post) => {
    try {
      const { useCartStore } = await import('@/stores/cart');
      const cartStore = useCartStore.getState();

      if (!cartStore.cart) {
        cartStore.createIndividualCart({
          restaurantId: post.restaurantId,
          restaurantName: post.restaurant.name,
          restaurantImage: post.restaurant.image,
        });
      }

      for (const item of post.items) {
        cartStore.addItem(convertPostItemToCartItem(item));
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onAddToCart={onAddToCart || handleAddToCartLocal}
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
          No more posts to load
        </p>
      )}
    </div>
  );
}
