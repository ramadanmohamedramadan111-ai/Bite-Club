<?php

namespace App\Services\Domain\User\Restaurant;

use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Restaurant;

class RestaurantDomainService
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    public function listForUser(array $filters): array
    {
        return $this->restaurantRepository->listForUser($filters);
    }

    public function getRestaurantForUser(int $id): Restaurant
    {
        $restaurant = $this->restaurantRepository->findForUser($id);
        
        if (!$restaurant) {
            throw new ModelNotFoundException(trans('restaurant.not_found'));
        }

        return $restaurant;
    }

    public function getNearest(float $latitude, float $longitude, int $limit = 5): Collection
    {
        return $this->restaurantRepository->getNearest($latitude, $longitude, $limit);
    }

    public function getHighestRated(int $limit = 10): Collection
    {
        return $this->restaurantRepository->getHighestRated($limit);
    }
}
