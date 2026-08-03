'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import type { RestaurantReview } from '@/types/restaurant';
import { Card, CardContent } from '@/components/ui/card';
import { useFormatter } from 'next-intl';
import { getMediaUrl } from '@/lib/utils';

type Props = {
  review: RestaurantReview;
};

export default function RestaurantReviewCard({ review }: Props) {
  const format = useFormatter();

  const initials = review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <Card className="border-border/40 shadow-xs hover:border-border/60 transition-colors duration-200">
      <CardContent className="space-y-3.5 p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="relative size-10 overflow-hidden rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0">
            {review.user?.profile_image ? (
              <Image
                src={getMediaUrl(review.user.profile_image)!}
                alt={review.user.name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-bold text-sm text-muted-foreground select-none">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-semibold text-sm text-foreground">{review.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format.relativeTime(new Date(review.created_at), new Date())}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
            <Star className="size-4.5 fill-yellow-400 text-yellow-400" />
            <span>{review.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pl-13.5">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  );
}
