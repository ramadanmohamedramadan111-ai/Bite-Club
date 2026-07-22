'use client';

import { PostType } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PostImages } from './PostImages';
import { useState, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { likePostAction, unlikePostAction } from '@/actions/feed';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: PostType;
  onAddToCart?: (post: PostType) => void;
}

export function PostCard({ post, onAddToCart }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const isPending = post.status === 'pending';

  useEffect(() => {
    setIsLiked(post.is_liked_by_user ?? false);
    setLikeCount(post.likes_count);
  }, [post.id, post.is_liked_by_user, post.likes_count]);

  const { execute: likePost } = useAction(likePostAction, {
    onError: ({ error }) => {
      toast.error(error.serverError?.message || 'Failed to like post.');
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    },
  });

  const { execute: unlikePost } = useAction(unlikePostAction, {
    onError: ({ error }) => {
      toast.error(error.serverError?.message || 'Failed to unlike post.');
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    },
  });

  const handleLike = () => {
    if (isPending) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    if (nextLiked) {
      likePost(Number(post.id));
    } else {
      unlikePost(Number(post.id));
    }
  };

  const hasItems = post.order?.items && post.order.items.length > 0;

  return (
    <Card className={`flex h-full w-full flex-col overflow-hidden transition-shadow hover:shadow-md ${isPending ? 'opacity-60' : ''}`}>
      <div className="relative">
        <PostImages
          post={post}
          imageClassName="aspect-square"
          showCounter
          imageHref={isPending ? undefined : `/posts/${post.id}`}
          className={isPending ? '' : 'transition-all hover:brightness-95'}
        />
        {isPending && (
          <Badge variant="secondary" className="absolute left-2 top-2 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )}
      </div>

      <div className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <Link href={`/users/${post.user.username}`} className="shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user.profile_image_url || undefined} />
              <AvatarFallback>
                {post.user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/users/${post.user.username}`}>
              <p className="truncate text-sm font-semibold hover:underline">
                {post.user.name}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              @{post.user.username}
            </p>
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-sm">{post.caption}</p>

        <Link href={`/restaurants/${post.restaurant.id}`}>
          <div className="mb-3 rounded-md bg-secondary p-2.5 transition-colors hover:bg-secondary/80">
            <p className="mb-0.5 text-xs text-muted-foreground">From</p>
            <p className="text-sm font-medium">{post.restaurant.name}</p>
          </div>
        </Link>

        {hasItems && (
          <div className="mb-3 space-y-1 text-sm">
            {post.order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="truncate">{item.item_name}</span>
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
            disabled={isPending}
            onClick={handleLike}>
            <Heart
              className="mr-1.5 h-4 w-4"
              fill={isLiked ? 'currentColor' : 'none'}
            />
            {likeCount}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={isPending}
            onClick={() => onAddToCart?.(post)}>
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

