<?php

namespace App\Repositories\Interfaces;

use App\Models\RestaurantReview;

interface RestaurantReviewRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserAndRestaurant(int $userId, int $restaurantId): ?RestaurantReview;
    public function listByRestaurant(int $restaurantId, array $filters): array;
    public function calculateAverageRatingAndCount(int $restaurantId): array;
    public function listFriendsReviewsByRestaurant(int $restaurantId, array $friendIds, array $filters): array;
    public function calculateFriendsAverageRatingAndCount(int $restaurantId, array $friendIds): array;
}
