'use client';

import { Post } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useSocialStore } from '@/stores/social';
import { PostImages } from './PostImages';

interface PostCardProps {
  post: Post;
  onAddToCart?: (post: Post) => void;
}

export function PostCard({ post, onAddToCart }: PostCardProps) {
  const toggleLike = useSocialStore((state) => state.toggleLike);
  const isLiked = useSocialStore((state) => state.isPostLiked(post.id));
  const storePost = useSocialStore((state) =>
    state.posts.find((item) => item.id === post.id),
  );
  const likeCount = storePost?.likeCount ?? post.likeCount;

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <PostImages
        post={post}
        imageClassName="aspect-square"
        showCounter
        imageHref={`/posts/${post.id}`}
        className="transition-all hover:brightness-95"
      />

      <div className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <Link href={`/users/${post.author.username}`} className="shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/users/${post.author.username}`}>
              <p className="truncate text-sm font-semibold hover:underline">
                {post.author.name}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              @{post.author.username}
            </p>
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-sm">{post.caption}</p>

        <Link href={`/restaurants/${post.restaurant.id}`}>
          <div className="mb-3 rounded-md bg-secondary p-2.5 transition-colors hover:bg-secondary/80">
            <p className="mb-0.5 text-xs text-muted-foreground">From</p>
            <p className="text-sm font-medium">{post.restaurant.name}</p>
            <p className="text-xs text-muted-foreground">
              {post.restaurant.address}
            </p>
          </div>
        </Link>

        {post.items.length > 0 && (
          <div className="mb-3 space-y-1 text-sm">
            {post.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="truncate">{item.name}</span>
                <span className="shrink-0 font-medium">
                  {item.quantity}x {item.price} EGP
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => toggleLike(post.id)}
          >
            <Heart
              className="mr-1.5 h-4 w-4"
              fill={isLiked ? 'currentColor' : 'none'}
            />
            {likeCount}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAddToCart?.(post)}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
