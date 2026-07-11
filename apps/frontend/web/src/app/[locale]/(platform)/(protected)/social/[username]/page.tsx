'use client';

import { UserProfilePosts } from '@/components/social/posts/UserProfilePosts';
import { clientFetch } from '@/utils/client-fetch';
import { SocialUser } from '@/types/social/friends';
import { Post } from '@/types/social/posts';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { socialUsers } from '@/data/social-users';

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setUsername(p.username));
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        // Use mock data for testing
        const foundUser = socialUsers.find((u) => u.username === username);
        setTimeout(() => {
          if (foundUser) {
            setUser(foundUser);
          } else {
            setError('User not found');
          }
          setLoading(false);
        }, 300);

        // Uncomment this for real API:
        // const data = await clientFetch<SocialUser>(`/users/${username}`, 'GET');
        // setUser(data);
      } catch (err) {
        setError('Failed to load user');
        console.error(err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

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

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b flex items-center gap-4 p-4 z-10">
          <Link href="/social/feed">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            {user.relationships.isFriend ? (
              <Button variant="outline" className="flex-1">
                Remove Friend
              </Button>
            ) : user.relationships.hasSentRequest ? (
              <Button variant="outline" className="flex-1" disabled>
                Request Pending
              </Button>
            ) : user.relationships.hasReceivedRequest ? (
              <>
                <Button className="flex-1">Accept</Button>
                <Button variant="outline" className="flex-1">
                  Decline
                </Button>
              </>
            ) : (
              <Button className="flex-1">Add Friend</Button>
            )}

            {user.relationships.isFollowing ? (
              <Button variant="outline" size="icon">
                Following
              </Button>
            ) : (
              <Button size="icon">Follow</Button>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Posts</h2>
          {user && (
            <UserProfilePosts
              userId={user.id}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
