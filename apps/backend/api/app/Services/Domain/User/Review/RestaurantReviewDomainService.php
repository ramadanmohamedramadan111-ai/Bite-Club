<?php

namespace App\Services\Domain\User\Review;

use App\Models\RestaurantReview;
use App\Repositories\Interfaces\RestaurantReviewRepositoryInterface;
use App\DTOs\User\Review\CreateReviewDto;
use App\DTOs\User\Review\UpdateReviewDto;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use Exception;

class RestaurantReviewDomainService
{
    public function __construct(
        private RestaurantReviewRepositoryInterface $reviewRepository,
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    public function createReview(CreateReviewDto $dto): RestaurantReview
    {
        // Check if user already reviewed
        $existing = $this->reviewRepository->findByUserAndRestaurant($dto->getUserId(), $dto->getRestaurantId());
        if ($existing) {
            throw new Exception(trans('restaurant_review.already_reviewed'));
        }

        return $this->reviewRepository->create([
            'user_id'       => $dto->getUserId(),
            'restaurant_id' => $dto->getRestaurantId(),
            'rating'        => $dto->getRating(),
            'comment'       => $dto->getComment(),
        ]);
    }

    public function updateReview(UpdateReviewDto $dto): RestaurantReview
    {
        $review = $this->reviewRepository->findByUserAndRestaurant($dto->getUserId(), $dto->getRestaurantId());
        if (!$review) {
            throw new Exception(trans('restaurant_review.not_found'));
        }

        $this->reviewRepository->update($review->id, $dto->getData());

        return $review->fresh();
    }

    public function deleteReview(int $userId, int $restaurantId): void
    {
        $review = $this->reviewRepository->findByUserAndRestaurant($userId, $restaurantId);
        if (!$review) {
            throw new Exception(trans('restaurant_review.not_found'));
        }

        $this->reviewRepository->delete($review->id);
    }

    public function getMyReview(int $userId, int $restaurantId): ?RestaurantReview
    {
        return $this->reviewRepository->findByUserAndRestaurant($userId, $restaurantId);
    }

    public function listReviews(int $restaurantId, array $filters): array
    {
        return $this->reviewRepository->listByRestaurant($restaurantId, $filters);
    }

    public function updateRestaurantStats(int $restaurantId): void
    {
        $stats = $this->reviewRepository->calculateAverageRatingAndCount($restaurantId);
        $this->restaurantRepository->updateStats($restaurantId, $stats['average'], $stats['count']);
    }
}
