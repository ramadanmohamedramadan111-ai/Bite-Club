<?php

namespace App\Services\Application\User\Review;

use App\Services\Domain\User\Review\RestaurantReviewDomainService;
use App\DTOs\User\Review\CreateReviewDto;
use App\DTOs\User\Review\UpdateReviewDto;
use App\DTOs\User\Review\DestroyReviewDto;
use App\DTOs\User\Review\GetMyReviewDto;
use App\DTOs\User\Review\IndexReviewDto;

class RestaurantReviewApplicationService
{
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
                    'profile_image_url' => $review->user->profile_image_url,
                ],
                'created_at' => $review->created_at,
            ];
        });

        return [
            'items' => $mappedItems,
            'meta'  => $result['meta'],
        ];
    }
}
