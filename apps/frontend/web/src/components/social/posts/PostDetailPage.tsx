'use client';

import { Post } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useSocialStore } from '@/stores/social';
import { PostImages } from './PostImages';

interface PostDetailPageProps {
  post: Post;
  onAddToCart?: (post: Post) => void;
}

export function PostDetailPage({ post, onAddToCart }: PostDetailPageProps) {
  const toggleLike = useSocialStore((state) => state.toggleLike);
  const isLiked = useSocialStore((state) => state.isPostLiked(post.id));
  const storePost = useSocialStore((state) =>
    state.posts.find((item) => item.id === post.id),
  );
  const likeCount = storePost?.likeCount ?? post.likeCount;

  const totalPrice = post.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/feed">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{post.author.name}</h1>
          <p className="text-sm text-muted-foreground">
            @{post.author.username}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <PostImages
          post={post}
          imageClassName="aspect-[4/3]"
          showCounter
          className="rounded-lg"
        />

        <Card className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link href={`/users/${post.author.username}`}>
                <div className="hover:opacity-75">
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </Card>

        <p className="text-sm">{post.caption}</p>

        <Link href={`/restaurants/${post.restaurant.id}`}>
          <Card className="cursor-pointer overflow-hidden p-3 transition-colors hover:bg-secondary/50">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 rounded">
                <Image
                  src={post.restaurant.image}
                  alt={post.restaurant.name}
                  fill
                  className="rounded object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs text-muted-foreground">
                  From Restaurant
                </div>
                <h3 className="font-semibold">{post.restaurant.name}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {post.restaurant.address}
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-3">
          <h3 className="mb-3 font-semibold">Order Details</h3>
          <div className="space-y-2">
            {post.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">{item.price * item.quantity} EGP</p>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="text-orange-500">{totalPrice} EGP</span>
            </div>
          </div>
        </Card>

        <Button size="lg" className="w-full" onClick={() => onAddToCart?.(post)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => toggleLike(post.id)}
        >
          <Heart
            className="mr-2 h-5 w-5"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          {likeCount}
        </Button>
      </div>
    </div>
  );
}
