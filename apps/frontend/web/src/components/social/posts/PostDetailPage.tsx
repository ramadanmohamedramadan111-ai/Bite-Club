'use client';

import { PostType } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { PostImages } from './PostImages';
import { useState, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { likePostAction, unlikePostAction } from '@/actions/feed';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface PostDetailPageProps {
  post: PostType;
  onAddToCart?: (post: PostType) => void;
}

export function PostDetailPage({ post, onAddToCart }: PostDetailPageProps) {
  const tc = useTranslations('common');
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  useEffect(() => {
    setIsLiked(post.is_liked_by_user ?? false);
    setLikeCount(post.likes_count);
  }, [post.id, post.is_liked_by_user, post.likes_count]);

  const { execute: likePost } = useAction(likePostAction, {
    onError: ({ error }) => {
      toast.error(error.serverError?.message || tc('failedToLike'));
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    },
  });

  const { execute: unlikePost } = useAction(unlikePostAction, {
    onError: ({ error }) => {
      toast.error(error.serverError?.message || tc('failedToUnlike'));
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    },
  });

  const handleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    if (nextLiked) {
      likePost(Number(post.id));
    } else {
      unlikePost(Number(post.id));
    }
  };

  const totalPrice = parseFloat(post.order?.total || '0');
  const hasItems = post.order?.items && post.order.items.length > 0;

  return (
    <div className="container mx-auto space-y-6 max-w-lg px-4 py-6">
      <div className="flex items-center gap-4">
        <Link href="/feed">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{post.user.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            @{post.user.username}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <PostImages
          post={post}
          imageClassName="aspect-[4/3]"
          showCounter
          className="rounded-lg"
        />

        <Card className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.profile_image || undefined} />
              <AvatarFallback>{post.user.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link href={`/users/${post.user.username}`}>
                <div className="hover:opacity-75">
                  <p className="font-semibold">{post.user.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{post.user.username}
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
              {post.restaurant.logo_url && (
                <div className="relative h-16 w-16 shrink-0 rounded">
                  <Image
                    src={post.restaurant.logo_url}
                    alt={post.restaurant.name}
                    fill
                    className="rounded object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs text-muted-foreground">
                  {tc('from')}
                </div>
                <h3 className="font-semibold">{post.restaurant.name}</h3>
              </div>
            </div>
          </Card>
        </Link>

        {hasItems && (
          <Card className="p-3">
            <h3 className="mb-3 font-semibold text-base">{tc('orderSummary')}</h3>
            <div className="space-y-2">
              {post.order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.item_name}</p>
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{item.price} EGP</p>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                <span>{tc('total')}</span>
                <span className="text-primary">{totalPrice.toFixed(2)} EGP</span>
              </div>
            </div>
          </Card>
        )}

        <Button size="lg" className="w-full" onClick={() => onAddToCart?.(post)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {tc('add')}
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleLike}
        >
          <Heart
            className="h-5 w-5"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          <span>{likeCount} likes</span>
        </Button>
      </div>
    </div>
  );
}
