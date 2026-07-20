import Image from 'next/image';
import { Star } from 'lucide-react';
import type { RestaurantReview } from '@/types/restaurant/restaurant';
import { Card, CardContent } from '@/components/ui/card';
import { getFormatter } from 'next-intl/server';

type Props = {
  review: RestaurantReview;
};

export default async function RestaurantReviewCard({ review }: Props) {
  const format = await getFormatter();

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-10 overflow-hidden rounded-full">
            <Image
              // src={review.user.profile_image_url}
              src={'/2'}
              alt={review.user.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{review.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {format.relativeTime(new Date(review.created_at), new Date())}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-sm">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            {review.rating}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      </CardContent>
    </Card>
  );
}

