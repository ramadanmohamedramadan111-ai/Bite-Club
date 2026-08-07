<?php

namespace App\Services\Application\User\Review;

use App\Services\Domain\User\Review\RestaurantReviewDomainService;
use App\DTOs\User\Review\CreateReviewDto;
use App\DTOs\User\Review\UpdateReviewDto;
use App\DTOs\User\Review\DestroyReviewDto;
use App\DTOs\User\Review\GetMyReviewDto;
use App\DTOs\User\Review\IndexReviewDto;
use App\Traits\UrlFormatterTrait;

class RestaurantReviewApplicationService
{
    use UrlFormatterTrait;

    public function __construct(
        private RestaurantReviewDomainService $domainService
    ) {}

    public function createReview(CreateReviewDto $dto): array
    {
        $review = $this->domainService->createReview($dto);
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at,
        ];
    }

    public function updateReview(UpdateReviewDto $dto): array
    {
        $review = $this->domainService->updateReview($dto);
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'updated_at' => $review->updated_at,
        ];
    }

    public function deleteReview(DestroyReviewDto $dto): void
    {
        $this->domainService->deleteReview($dto->getUserId(), $dto->getRestaurantId());
    }

    public function getMyReview(GetMyReviewDto $dto): ?array
    {
        $review = $this->domainService->getMyReview($dto->getUserId(), $dto->getRestaurantId());
        
        if (!$review) {
            return null;
        }

        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
        ];
    }

    public function listReviews(IndexReviewDto $dto): array
    {
        $result = $this->domainService->listReviews($dto->getRestaurantId(), $dto->getFilters());

        $mappedItems = $result['items']->map(function($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'user' => [
                    'id' => $review->user->id,
                    'name' => trim($review->user->first_name . ' ' . $review->user->last_name),
                    'profile_image' => $this->formatImageUrl($review->user->profile_image_url),
                ],
                'created_at' => $review->created_at,
            ];
        });

        return [
            'items' => $mappedItems,
            'meta'  => $result['meta'],
        ];
    }

    public function listFriendsReviews(IndexReviewDto $dto): array
    {
        $userId = auth('user')->id();
        if (!$userId) {
            return [
                'summary' => [
                    'total_reviews' => 0,
                    'average_rating' => 0.0,
                ],
                'items' => collect(),
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => isset($dto->getFilters()['per_page']) ? (int)$dto->getFilters()['per_page'] : 15,
                    'total' => 0,
                ]
            ];
        }

        $friendIds = \App\Models\Friendship::query()
            ->where('user_low_id', $userId)
            ->pluck('user_high_id')
            ->merge(
                \App\Models\Friendship::query()
                    ->where('user_high_id', $userId)
                    ->pluck('user_low_id')
            )
            ->toArray();

        if (empty($friendIds)) {
            return [
                'summary' => [
                    'total_reviews' => 0,
                    'average_rating' => 0.0,
                ],
                'items' => collect(),
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => isset($dto->getFilters()['per_page']) ? (int)$dto->getFilters()['per_page'] : 15,
                    'total' => 0,
                ]
            ];
        }

        $result = $this->domainService->listFriendsReviews($dto->getRestaurantId(), $friendIds, $dto->getFilters());
        $stats = $this->domainService->calculateFriendsStats($dto->getRestaurantId(), $friendIds);

        $mappedItems = $result['items']->map(function($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'user' => [
                    'id' => $review->user->id,
                    'name' => trim($review->user->first_name . ' ' . $review->user->last_name),
                    'profile_image' => $this->formatImageUrl($review->user->profile_image_url),
                ],
                'created_at' => $review->created_at,
            ];
        });

        return [
            'summary' => [
                'total_reviews' => $stats['count'],
                'average_rating' => round($stats['average'], 1),
            ],
            'items' => $mappedItems,
            'meta'  => $result['meta'],
        ];
    }
}
