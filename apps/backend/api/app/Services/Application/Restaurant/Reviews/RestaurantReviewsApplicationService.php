<?php

namespace App\Services\Application\Restaurant\Reviews;

use App\Models\RestaurantReview;
use App\DTOs\Restaurant\Reviews\RestaurantReviewsDto;

class RestaurantReviewsApplicationService
{
    public function getReviewsData(RestaurantReviewsDto $dto): array
    {
        $restaurantId = $dto->getRestaurantId();

        $totalReviews = RestaurantReview::where('restaurant_id', $restaurantId)->count();
        $averageRating = (float) (RestaurantReview::where('restaurant_id', $restaurantId)->avg('rating') ?? 0.0);
        
        $ratingsCounts = RestaurantReview::where('restaurant_id', $restaurantId)
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $ratingsBreakdown = [
            '5' => (int) ($ratingsCounts[5] ?? 0),
            '4' => (int) ($ratingsCounts[4] ?? 0),
            '3' => (int) ($ratingsCounts[3] ?? 0),
            '2' => (int) ($ratingsCounts[2] ?? 0),
            '1' => (int) ($ratingsCounts[1] ?? 0),
        ];

        $reviewsQuery = RestaurantReview::where('restaurant_id', $restaurantId)
            ->with('user')
            ->latest('id');

        if ($dto->getRating() !== null) {
            $reviewsQuery->where('rating', $dto->getRating());
        }

        if ($dto->getSearch() !== null && $dto->getSearch() !== '') {
            $search = $dto->getSearch();
            $reviewsQuery->where(function ($query) use ($search) {
                $query->where('comment', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($uQuery) use ($search) {
                        $uQuery->where('first_name', 'like', '%' . $search . '%')
                            ->orWhere('last_name', 'like', '%' . $search . '%')
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ['%' . $search . '%']);
                    });
            });
        }

        $paginated = $reviewsQuery->paginate(
            $dto->getPerPage(),
            ['*'],
            'page',
            $dto->getPage()
        );

        return [
            'summary' => [
                'average_rating' => round($averageRating, 1),
                'total_reviews' => $totalReviews,
                'ratings' => $ratingsBreakdown,
            ],
            'reviews' => $paginated,
        ];
    }
}
