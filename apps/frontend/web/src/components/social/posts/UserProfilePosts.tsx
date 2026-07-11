'use client';

import { useEffect, useState } from 'react';
import { PostCard } from './PostCard';
import { Post, PostItem } from '@/types/social/posts';
import { CartItem } from '@/types/cart/cart';
import { Loader2 } from 'lucide-react';
import { mockPosts } from '@/data/mock-posts';

interface UserProfilePostsProps {
  userId: string;
  onAddToCart?: (post: Post) => void;
}

// Helper function to convert PostItem to CartItem
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 3;

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  // Simulate initial load
  useEffect(() => {
    setTimeout(() => {
      // Filter posts by userId
      const userPosts = mockPosts.filter((p) => p.authorId === userId);
      setPosts(userPosts.slice(0, postsPerPage));
      setIsLoading(false);
    }, 400);
  }, [userId]);

  // Simulate infinite scroll
  useEffect(() => {
    if (!observedElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage && !isLoading) {
          setIsFetchingNextPage(true);
          // Simulate API delay
          setTimeout(() => {
            const userPosts = mockPosts.filter((p) => p.authorId === userId);
            const nextPage = currentPage + 1;
            const startIdx = nextPage * postsPerPage;
            const newPosts = userPosts.slice(
              startIdx,
              startIdx + postsPerPage,
            );

            if (newPosts.length > 0) {
              setPosts((prev) => [...prev, ...newPosts]);
              setCurrentPage(nextPage);
            }
            setIsFetchingNextPage(false);
          }, 500);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, isFetchingNextPage, isLoading, currentPage, userId]);

  const userPosts = mockPosts.filter((p) => p.authorId === userId);
  const hasNextPage = posts.length < userPosts.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-12 gap-4">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  const handleAddToCartLocal = async (post: Post) => {
    try {
      // Add items from post to cart using cart store
      const { useCartStore } = await import('@/stores/cart');
      const cartStore = useCartStore.getState();

      // Create individual cart if needed
      if (!cartStore.cart) {
        cartStore.createIndividualCart({
          restaurantId: post.restaurantId,
          restaurantName: post.restaurant.name,
          restaurantImage: post.restaurant.image,
        });
      }

      // Add each item from post
      for (const item of post.items) {
        cartStore.addItem(convertPostItemToCartItem(item));
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onAddToCart={onAddToCart || handleAddToCartLocal}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={setObservedElement} className="py-8 flex justify-center">
        {isFetchingNextPage && <Loader2 className="animate-spin" />}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No more posts to load
        </div>
      )}
    </div>
  );
}
