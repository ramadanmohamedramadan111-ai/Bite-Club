<?php

namespace App\Services\Domain\RestaurantOpeningHour;

use App\Models\RestaurantOpeningHour;
use App\Repositories\Interfaces\RestaurantOpeningHourRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RestaurantOpeningHourDomainService
{
    public function __construct(
        private RestaurantOpeningHourRepositoryInterface $restaurantOpeningHourRepository
    ) {}

    /**
     * Get all opening hours for a restaurant ordered by day of week.
     *
     * @param int $restaurantId
     * @return Collection
     */
    public function getForRestaurant(int $restaurantId): Collection
    {
        return $this->restaurantOpeningHourRepository->get(
            ['restaurant_id' => $restaurantId],
            ['*'],
            [],
            ['day_of_week' => 'asc']
        );
    }

    /**
     * Update/insert opening hours for a restaurant.
     *
     * @param int $restaurantId
     * @param array $openingHoursData
     * @return Collection
     */
    public function updateForRestaurant(int $restaurantId, array $openingHoursData): Collection
    {
        foreach ($openingHoursData as $hourDto) {
            $this->restaurantOpeningHourRepository->query()->updateOrCreate(
                [
                    'restaurant_id' => $restaurantId,
                    'day_of_week'   => $hourDto->getDayOfWeek(),
                ],
                [
                    'opens_at'  => $hourDto->getIsClosed() ? null : $hourDto->getOpensAt(),
                    'closes_at' => $hourDto->getIsClosed() ? null : $hourDto->getClosesAt(),
                    'is_closed' => $hourDto->getIsClosed(),
                ]
            );
        }

        return $this->getForRestaurant($restaurantId);
    }
}
