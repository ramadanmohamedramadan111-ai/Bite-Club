<?php

namespace App\Observers;

use App\Jobs\Ai\AiSyncReviewJob;
use App\Models\RestaurantReview;
use App\Services\Domain\User\Review\RestaurantReviewDomainService;
use Illuminate\Support\Facades\App;

class RestaurantReviewObserver
{
    private function updateRestaurantStats(RestaurantReview $review): void
    {
        $domainService = App::make(RestaurantReviewDomainService::class);
        $domainService->updateRestaurantStats($review->restaurant_id);
    }

    public function created(RestaurantReview $review): void
    {
        $this->updateRestaurantStats($review);
        AiSyncReviewJob::dispatch($this->reviewPayload($review), 'created');
    }

    public function updated(RestaurantReview $review): void
    {
        $this->updateRestaurantStats($review);
        AiSyncReviewJob::dispatch($this->reviewPayload($review), 'updated');
    }

    public function deleted(RestaurantReview $review): void
    {
        $this->updateRestaurantStats($review);
        AiSyncReviewJob::dispatch($this->reviewPayload($review), 'deleted');
    }

    private function reviewPayload(RestaurantReview $review): array
    {
        return [
            'id' => $review->id,
            'restaurant_id' => $review->restaurant_id,
            'user_id' => $review->user_id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at?->toIso8601String(),
            'updated_at' => $review->updated_at?->toIso8601String(),
        ];
    }
}
