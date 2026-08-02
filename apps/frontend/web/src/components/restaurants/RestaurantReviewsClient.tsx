'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAction } from 'next-safe-action/hooks';
import { Star, Edit3, Trash2, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
} from '@/actions/restaurants';
import type { RestaurantReviewUser } from '@/types/restaurant';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';

interface RestaurantReviewsClientProps {
  restaurantId: number;
  isAuthenticated: boolean;
  myReview: RestaurantReviewUser | null;
}

export default function RestaurantReviewsClient({
  restaurantId,
  isAuthenticated,
  myReview,
}: RestaurantReviewsClientProps) {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 1. Create review action
  const { execute: createReview, isExecuting: isCreating } = useAction(
    createReviewAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(t('addReviewSuccess'));
          setIsWriting(false);
          setComment('');
        } else {
          toast.error(data?.message || 'Failed to post review');
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to post review');
      },
    },
  );

  // 2. Update review action
  const { execute: updateReview, isExecuting: isUpdating } = useAction(
    updateReviewAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(t('updateReviewSuccess'));
          setIsEditing(false);
        } else {
          toast.error(data?.message || 'Failed to update review');
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to update review');
      },
    },
  );

  // 3. Delete review action
  const { execute: deleteReview, isExecuting: isDeleting } = useAction(
    deleteReviewAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(t('deleteReviewSuccess'));
          setIsEditing(false);
          setIsWriting(false);
        } else {
          toast.error(data?.message || 'Failed to delete review');
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to delete review');
      },
    },
  );

  const handleStartWrite = () => {
    setRating(5);
    setComment('');
    setIsWriting(true);
  };

  const handleStartEdit = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
      setIsEditing(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(t('comment.required'));
      return;
    }

    if (isEditing) {
      updateReview({
        restaurant_id: restaurantId,
        rating,
        comment,
      });
    } else {
      createReview({
        restaurant_id: restaurantId,
        rating,
        comment,
      });
    }
  };

  const handleDelete = () => {
    deleteReview(restaurantId);
  };

  // If user is not authenticated, they cannot manage reviews
  if (!isAuthenticated) {
    return null;
  }

  // Edit/Write Form Component
  const renderForm = () => (
    <Card className="border-primary/20 bg-primary/3 dark:bg-primary/1 shadow-xs border-dashed animate-in fade-in slide-in-from-top-4 duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <MessageSquarePlus className="size-4.5 text-primary" />
          <span>{isEditing ? t('editReview') : t('writeReview')}</span>
        </CardTitle>
        <CardDescription>{t('commentPlaceholder')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              {t('ratingLabel')}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-md hover:bg-muted/80 transition-colors cursor-pointer">
                  <Star
                    className={cn(
                      'size-7 transition-all duration-150 transform hover:scale-110',
                      star <= (hoverRating ?? rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]'
                        : 'text-muted border-none',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              {t('commentLabel')}
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              rows={4}
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none outline-hidden border-border/40 focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setIsWriting(false);
              }}
              className="rounded-xl cursor-pointer">
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || isUpdating}
              className="rounded-xl cursor-pointer">
              {isEditing ? t('update') : t('submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* 1. If user has a review and is not editing */}
      {myReview && !isEditing && (
        <Card className="border-emerald-500/30 bg-emerald-500/3 dark:bg-emerald-500/1 shadow-xs animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-emerald-500/10 flex flex-row items-center justify-between space-y-0 py-3.5">
            <div className="flex items-center gap-2">
              <Star className="size-4.5 text-emerald-500 fill-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                {t('myReview')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEdit}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title={t('editReview')}>
                <Edit3 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                title={t('deleteReview')}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'size-4.5',
                    star <= myReview.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted',
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2 font-medium">
                {new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(myReview.updated_at || myReview.created_at))}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {myReview.comment || (
                <span className="italic text-muted-foreground">
                  {t('reviewPlaceholder')}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 2. If editing/writing */}
      {(isEditing || isWriting) && renderForm()}

      {/* 3. If no review yet and not writing */}
      {!myReview && !isWriting && (
        <Button
          onClick={handleStartWrite}
          className="w-full sm:w-auto gap-2 rounded-xl cursor-pointer"
          variant="outline">
          <MessageSquarePlus className="size-4.5" />
          <span>{t('writeReview')}</span>
        </Button>
      )}

      {/* 4. Confirmation dialog for deletion */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDesc')}
        confirmText={t('deleteReview')}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

