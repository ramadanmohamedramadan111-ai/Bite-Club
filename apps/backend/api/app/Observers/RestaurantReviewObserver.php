<?php

namespace App\Observers;

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
    }

    public function updated(RestaurantReview $review): void
    {
        $this->updateRestaurantStats($review);
    }

    public function deleted(RestaurantReview $review): void
    {
        $this->updateRestaurantStats($review);
    }
}
