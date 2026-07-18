<?php

namespace App\Services\Application;

use App\DTOs\RestaurantOpeningHour\UpdateRestaurantOpeningHoursDto;
use App\Services\Domain\RestaurantOpeningHour\RestaurantOpeningHourDomainService;
use Illuminate\Database\Eloquent\Collection;

class RestaurantOpeningHourApplicationService
{
    public function __construct(
        private RestaurantOpeningHourDomainService $restaurantOpeningHourDomainService
    ) {}

    public function show(int $restaurantId): Collection
    {
        return $this->restaurantOpeningHourDomainService->getForRestaurant($restaurantId);
    }

    public function update(UpdateRestaurantOpeningHoursDto $dto): Collection
    {
        return $this->restaurantOpeningHourDomainService->updateForRestaurant(
            $dto->getRestaurantId(),
            $dto->getOpeningHours()
        );
    }
}
