'use client';

import { PostDetailPage } from '@/components/social/posts/PostDetailPage';
import { Post, PostItem } from '@/types/social/posts';
import { CartItem } from '@/types/cart/cart';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useSocialStore } from '@/stores/social';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

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

export default function PostPage({ params }: PostPageProps) {
  const getPostById = useSocialStore((state) => state.getPostById);
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setPostId(p.postId));
  }, [params]);

  useEffect(() => {
    if (!postId) return;
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [postId]);

  const post = postId ? getPostById(postId) : undefined;

  const handleAddToCart = async (post: Post) => {
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

      router.push('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return <PostDetailPage post={post} onAddToCart={handleAddToCart} />;
}
