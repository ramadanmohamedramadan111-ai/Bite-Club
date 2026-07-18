<?php

namespace App\Services\Domain\Restaurant;

use App\Models\Restaurant;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;

class RestaurantProfileDomainService
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    public function getProfile(int $restaurantId): Restaurant
    {
        return $this->restaurantRepository->findOrFail($restaurantId);
    }

    public function updateProfile(int $restaurantId, array $data): Restaurant
    {
        if (!empty($data)) {
            $this->restaurantRepository->update($restaurantId, $data);
        }

        return $this->getProfile($restaurantId);
    }
}
