'use client';

import { useState, useEffect } from 'react';
import { SocialUser } from '@/types/social/friends';
import { Post, PostItem } from '@/types/social/posts';
import { CartItem } from '@/types/cart/cart';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { UserProfilePosts } from '@/components/social/posts/UserProfilePosts';

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

// Mock current user
const mockCurrentUser: SocialUser = {
  id: 'current-user',
  username: 'currentuser',
  name: 'Your Name',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  relationships: {
    isFriend: false,
    hasSentRequest: false,
    hasReceivedRequest: false,
    isFollowing: false,
    isBlocked: false,
  },
};

export default function MyProfilePage() {
  const [user, setUser] = useState<SocialUser>(mockCurrentUser);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading current user profile
    setTimeout(() => {
      setUser(mockCurrentUser);
      setLoading(false);
    }, 300);
  }, []);

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
        cartStore.addItem(convertPostItemToCartItem(item));
      }

      router.push('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b flex items-center justify-between p-4 z-10">
          <div>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">Your posts</p>
          </div>
          <Link href="/social/profile/edit">
            <Button size="icon" variant="ghost">
              <Edit className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Profile Section */}
        <div className="border-b p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-center mb-4">
            <div>
              <div className="text-lg font-semibold">342</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-lg font-semibold">12.4K</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-lg font-semibold">850</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">My Posts</h2>
          <UserProfilePosts
            userId={user.id}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}
