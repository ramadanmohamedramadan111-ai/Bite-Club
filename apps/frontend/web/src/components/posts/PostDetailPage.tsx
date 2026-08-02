'use client';

import { PostType } from '@/types/posts';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { PostImages } from './PostImages';
import { useState, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import {
  copyOrderAction,
  likePostAction,
  unlikePostAction,
} from '@/actions/feed';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { getMediaUrl } from '@/lib/utils';
interface PostDetailPageProps {
  post: PostType;
}

export function PostDetailPage({ post }: PostDetailPageProps) {
  const tc = useTranslations('common');
  const tCustomizer = useTranslations('restaurants');
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [replaceCartDialogOpen, setReplaceCartDialogOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);

  const { execute: copyOrder, isExecuting: isCopying } = useAction(
    copyOrderAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(
            data.message || 'Order copied to your cart successfully!',
          );
          router.push('/cart');
        } else {
          toast.error(data?.message || 'Failed to copy order.');
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || 'Failed to copy order.');
      },
    },
  );

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
    <div className="container mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Link href="/posts">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl border border-border/40 hover:bg-accent/40">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            {post.restaurant.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            @{post.user.username}'s review
          </p>
        </div>
      </div>

      <Card className="mx-auto max-w-xl p-6 sm:p-8 space-y-6 border border-border/40 shadow-md bg-card/60 backdrop-blur-md rounded-3xl">
        <div className="flex items-center justify-between pb-2 border-b border-border/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/30 shadow-xs">
              <AvatarImage src={getMediaUrl(post.user.profile_image_url)} />
              <AvatarFallback className="font-bold text-sm bg-accent text-accent-foreground">
                {post.user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground leading-tight">
                {post.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                @{post.user.username}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
            onClick={handleLike}>
            <Heart
              className={`h-4.5 w-4.5 transition-transform active:scale-125 ${isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
            />
            <span className="text-xs font-semibold">{likeCount}</span>
          </Button>
        </div>

        <PostImages
          post={post}
          imageClassName="aspect-[4/3] rounded-2xl"
          showCounter
          className="rounded-2xl overflow-hidden border border-border/30"
        />

        {post.caption && (
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
            "{post.caption}"
          </p>
        )}

        <Link href={`/restaurants/${post.restaurant.id}`}>
          <Card className="cursor-pointer overflow-hidden p-4 transition-all duration-200 border border-border/40 hover:border-primary/20 hover:bg-primary/[0.02] bg-card rounded-2xl shadow-2xs">
            <div className="flex items-center gap-4">
              {post.restaurant.logo_url ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-muted">
                  <Image
                    src={getMediaUrl(post.restaurant.logo_url)!}
                    alt={post.restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm uppercase">
                  {post.restaurant.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  {tc('from')}
                </p>
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">
                  {post.restaurant.name}
                </h3>
              </div>
            </div>
          </Card>
        </Link>

        {hasItems && (
          <Card className="p-5 border border-border/40 rounded-2xl bg-muted/15 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
              {tc('orderSummary')}
            </h3>
            <div className="space-y-3.5">
              {post.order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground/90 truncate">
                      {item.item_name}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-foreground/80 shrink-0 ml-4">
                    {item.price} EGP
                  </p>
                </div>
              ))}
              <div className="flex justify-between border-t border-border/45 pt-3.5 font-bold text-sm sm:text-base">
                <span className="text-foreground/90">{tc('total')}</span>
                <span className="text-primary">
                  {totalPrice.toFixed(2)} EGP
                </span>
              </div>
            </div>
          </Card>
        )}

        <Button
          size="lg"
          className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary hover:to-orange-600 border-0 text-white font-bold shadow-md shadow-primary/10 py-6 transition-all duration-200"
          disabled={isCopying}
          onClick={() => {
            if (cart && cart.restaurant.id !== post.restaurant.id) {
              setReplaceCartDialogOpen(true);
            } else {
              copyOrder(Number(post.id));
            }
          }}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isCopying
            ? tc('copying')
            : tc('copyOrder')}
        </Button>
      </Card>

      <ConfirmDialog
        open={replaceCartDialogOpen}
        onOpenChange={setReplaceCartDialogOpen}
        title={tCustomizer('copyOrderTitle')}
        description={tCustomizer('copyOrderDesc', {
          current: cart?.restaurant.name || '',
          new: post.restaurant.name,
        })}
        confirmText={tCustomizer('copyOrder')}
        cancelText={tCustomizer('keepCurrentCart')}
        onConfirm={() => {
          copyOrder(Number(post.id));
          setReplaceCartDialogOpen(false);
        }}
      />
    </div>
  );
}

