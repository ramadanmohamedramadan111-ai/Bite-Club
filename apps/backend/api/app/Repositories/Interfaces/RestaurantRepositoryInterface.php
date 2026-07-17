<?php

namespace App\Repositories\Interfaces;

use App\Models\Restaurant;
use Illuminate\Support\Collection;

interface RestaurantRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?Restaurant;
    public function findByPhone(string $phone): ?Restaurant;

    public function listForAdmin(array $filters): array;
    public function listForUser(array $filters): array;
    
    public function getNearest(float $latitude, float $longitude, int $limit = 5): Collection;
    public function getHighestRated(int $limit = 10): Collection;
    public function updateStats(int $restaurantId, float $averageRating, int $reviewsCount): bool;
}
