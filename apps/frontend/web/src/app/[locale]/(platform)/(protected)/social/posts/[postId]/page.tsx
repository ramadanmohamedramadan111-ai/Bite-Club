'use client';

import { PostDetailPage } from '@/components/social/posts/PostDetailPage';
import { clientFetch } from '@/utils/client-fetch';
import { Post } from '@/types/social/posts';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { mockPostDetail } from '@/data/mock-post-detail';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setPostId(p.postId));
  }, [params]);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        // Use mock data for testing
        setTimeout(() => {
          setPost(mockPostDetail);
          setLoading(false);
        }, 300);

        // Uncomment this for real API:
        // const data = await clientFetch<Post>(`/posts/${postId}`, 'GET');
        // setPost(data);
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleAddToCart = async (post: Post) => {
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
        cartStore.addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: post.restaurantId,
          image: post.restaurant.image,
        } as any);
      }

      router.push('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">{error || 'Post not found'}</p>
      </div>
    );
  }

  return <PostDetailPage post={post} onAddToCart={handleAddToCart} />;
}
