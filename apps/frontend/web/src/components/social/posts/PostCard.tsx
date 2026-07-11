'use client';

import { Post } from '@/types/social/posts';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  onAddToCart?: (post: Post) => void;
}

export function PostCard({ post, onAddToCart }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/social/posts/${post.id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted hover:brightness-90 transition-all cursor-pointer">
          <Image
            src={post.image}
            alt={post.caption}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/social/${post.author.username}`} className="shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/social/${post.author.username}`}>
              <p className="font-semibold text-sm truncate hover:underline">
                {post.author.name}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              @{post.author.username}
            </p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm mb-3 line-clamp-2">{post.caption}</p>

        {/* Restaurant Info */}
        <Link href={`/restaurants/${post.restaurant.id}`}>
          <div className="mb-4 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">From</p>
            <p className="font-medium text-sm">{post.restaurant.name}</p>
            <p className="text-xs text-muted-foreground">
              {post.restaurant.address}
            </p>
          </div>
        </Link>

        {/* Items */}
        {post.items.length > 0 && (
          <div className="mb-4 space-y-2 text-sm">
            {post.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">
                  {item.quantity}x {item.price} EGP
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <Button variant="ghost" size="sm" className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            {post.likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.commentCount}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAddToCart?.(post)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
