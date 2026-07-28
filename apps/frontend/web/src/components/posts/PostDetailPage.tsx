'use client';

import { PostType } from '@/types/posts';
import { cn } from '@/lib/utils';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowLeft, ShoppingCart, Calendar, Info } from 'lucide-react';
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

interface PostDetailPageProps {
  post: PostType;
}

export function PostDetailPage({ post }: PostDetailPageProps) {
  const tc = useTranslations('common');
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

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

  const hasItems = post.order?.items && post.order.items.length > 0;
  const subtotal = post.order?.items?.reduce((sum, item) => sum + parseFloat(item.price || '0') * item.quantity, 0) || parseFloat(post.order?.subtotal || '0');
  const deliveryFee = parseFloat(post.order?.delivery_fee || '0');
  const serviceFee = parseFloat(post.order?.service_fee || '0');
  const totalPrice = subtotal + deliveryFee + serviceFee;

  return (
    <div className="w-full px-4 py-8">
      {/* Header bar with description */}
      <div className="flex flex-col gap-4 border-b border-border/30 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/feed">
            <Button variant="outline" size="icon" className="rounded-xl border-border bg-background/50 hover:bg-background cursor-pointer h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{post.user.name}</h1>
            <p className="text-xs text-muted-foreground">@{post.user.username}</p>
          </div>
        </div>
        
        {/* Description alert so the user knows where they are */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-2">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-0.5">Post Details View</p>
            Review the details of this shared meal order from <span className="font-semibold text-foreground">{post.restaurant.name}</span>. You can copy the identical items directly to your cart to experience the exact same flavors.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Media carousel and captions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Post Images carousel/display */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
            <PostImages
              post={post}
              imageClassName="aspect-[16/10] object-cover"
              showCounter
              className="w-full"
            />
          </div>

          {/* User metadata badge */}
          <Card className="rounded-2xl border border-border bg-card/65 backdrop-blur-md p-4 shadow-3xs">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={post.user.profile_image_url || undefined} />
                <AvatarFallback className="font-bold bg-muted/40">
                  {post.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link href={`/users/${post.user.username}`}>
                  <div className="hover:opacity-75">
                    <p className="font-bold text-sm text-foreground leading-none">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      @{post.user.username}
                    </p>
                  </div>
                </Link>
              </div>
              
              {post.created_at && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/45 px-3 py-1 rounded-xl">
                  <Calendar className="size-3.5" />
                  <span>
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(post.created_at))}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Caption */}
          {post.caption && (
            <div className="bg-muted/15 rounded-2xl border border-border/30 p-5">
              <p className="text-sm text-foreground leading-relaxed italic">"{post.caption}"</p>
            </div>
          )}

          {/* Restaurant link card */}
          <Link href={`/restaurants/${post.restaurant.id}`}>
            <Card className="cursor-pointer overflow-hidden p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-border hover:bg-accent/40 shadow-3xs transition-all duration-300">
              <div className="flex gap-4 items-center">
                {post.restaurant.logo_url ? (
                  <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                    <Image
                      src={post.restaurant.logo_url}
                      alt={post.restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-xl border border-dashed border-border bg-muted flex items-center justify-center shrink-0">
                    <ShoppingCart className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-2xs font-bold text-primary uppercase tracking-wider mb-0.5">
                    {tc('from')}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{post.restaurant.name}</h3>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Right Side: Order summary breakdown and primary CTA buttons */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order details summary */}
          {hasItems && (
            <Card className="rounded-2xl border border-border bg-card/65 p-6 shadow-3xs">
              <h3 className="mb-4 font-bold text-sm text-foreground uppercase tracking-wider">
                {tc('orderSummary')}
              </h3>
              
              {/* Item List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-4">
                {post.order.items.map((item) => {
                  const itemPrice = parseFloat(item.price || '0');
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-1 border-b border-border/20 last:border-b-0">
                      <div>
                        <p className="font-bold text-foreground">
                          {item.item_name}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Qty: {item.quantity} · {itemPrice.toFixed(2)} EGP each
                        </p>
                      </div>
                      <p className="font-bold text-foreground">{itemTotal.toFixed(2)} EGP</p>
                    </div>
                  );
                })}
              </div>

              {/* Cost breakdown checklist */}
              <dl className="space-y-2.5 text-sm border-t border-border/30 pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <dt>{tc('subtotal') || 'Subtotal'}</dt>
                  <dd className="font-semibold text-foreground">
                    {subtotal.toFixed(2)} EGP
                  </dd>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>{tc('deliveryFee') || 'Delivery Fee'}</dt>
                    <dd className="font-semibold text-foreground">
                      {deliveryFee.toFixed(2)} EGP
                    </dd>
                  </div>
                )}
                {serviceFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>{tc('serviceFee') || 'Service Fee'}</dt>
                    <dd className="font-semibold text-foreground">
                      {serviceFee.toFixed(2)} EGP
                    </dd>
                  </div>
                )}
                
                <div className="flex justify-between border-t border-border pt-4 font-bold text-base">
                  <span>{tc('total')}</span>
                  <span className="text-primary text-lg">
                    {totalPrice.toFixed(2)} EGP
                  </span>
                </div>
              </dl>
            </Card>
          )}

          {/* Direct Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Copy Order button */}
            <Button
              className="w-full rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer"
              disabled={isCopying}
              onClick={() => copyOrder(Number(post.id))}>
              <ShoppingCart className="mr-2 h-4.5 w-4.5" />
              Copy Order to Cart
            </Button>

            {/* Like button */}
            <Button
              variant="outline"
              onClick={handleLike}
              className="w-full rounded-xl h-11 font-bold text-sm shadow-3xs cursor-pointer border-border hover:bg-accent/40 text-muted-foreground hover:text-foreground">
              <Heart className={cn("mr-2 h-4.5 w-4.5 transition-all duration-300", isLiked ? "fill-rose-500 text-rose-500 scale-110" : "")} />
              <span>{likeCount} Likes</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
