'use client';

import { useState } from 'react';
import { Post } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface PostDetailPageProps {
  post: Post;
  onAddToCart?: (post: Post) => void;
}

export function PostDetailPage({ post, onAddToCart }: PostDetailPageProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // TODO: Call API to update like status
  };

  const totalPrice = post.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b flex items-center gap-4 p-4 z-10">
          <Link href="/feed">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="font-semibold">{post.author.name}</h2>
            <p className="text-xs text-muted-foreground">
              @{post.author.username}
            </p>
          </div>
        </div>

        <div className="p-4">
          {/* Image */}
          <div className="relative aspect-square mb-6 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.caption}
              fill
              className="object-cover"
            />
          </div>

          {/* Author Info */}
          <Card className="p-4 mb-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link href={`/social/${post.author.username}`}>
                  <div className="hover:opacity-75">
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{post.author.username}
                    </p>
                  </div>
                </Link>
              </div>
              <Link href={`/social/${post.author.username}`}>
                <Button size="sm">Follow</Button>
              </Link>
            </div>
          </Card>

          {/* Caption */}
          <p className="text-base mb-6">{post.caption}</p>

          {/* Restaurant Card */}
          <Link href={`/restaurants/${post.restaurant.id}`}>
            <Card className="p-4 mb-6 hover:bg-secondary/50 transition-colors cursor-pointer overflow-hidden">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded shrink-0">
                  <Image
                    src={post.restaurant.image}
                    alt={post.restaurant.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    From Restaurant
                  </div>
                  <h3 className="font-semibold">{post.restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.restaurant.address}
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Order Details */}
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-3">
              {post.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{item.price * item.quantity} EGP</p>
                </div>
              ))}
              <div className="pt-3 border-t flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-orange-500">{totalPrice} EGP</span>
              </div>
            </div>
          </Card>

          {/* Cart Button */}
          <Button
            size="lg"
            className="w-full mb-6"
            onClick={() => onAddToCart?.(post)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>

          {/* Engagement */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={handleLike}
            >
              <Heart
                className="w-5 h-5 mr-2"
                fill={isLiked ? 'currentColor' : 'none'}
              />
              {likeCount}
            </Button>
            <Button variant="ghost" size="lg" className="flex-1">
              <MessageCircle className="w-5 h-5 mr-2" />
              {post.commentCount}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
