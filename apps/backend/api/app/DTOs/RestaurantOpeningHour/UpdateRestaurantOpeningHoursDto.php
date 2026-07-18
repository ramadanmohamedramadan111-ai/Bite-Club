<?php

namespace App\DTOs\RestaurantOpeningHour;

use App\Http\Requests\RestaurantOpeningHour\UpdateRestaurantOpeningHoursRequest;

class UpdateRestaurantOpeningHoursDto
{
    /**
     * @param RestaurantOpeningHourDto[] $openingHours
     */
    public function __construct(
        private int $restaurantId,
        private array $openingHours
    ) {}

    public static function fromValidatedRequest(UpdateRestaurantOpeningHoursRequest $request): self
    {
        $data = $request->validated();
        $restaurantId = (int) $data['restaurant_id'];

        $openingHours = array_map(function ($item) {
            return new RestaurantOpeningHourDto(
                (int) $item['day_of_week'],
                $item['opens_at'] ?? null,
                $item['closes_at'] ?? null,
                (bool) $item['is_closed']
            );
        }, $data['opening_hours']);

        return new self($restaurantId, $openingHours);
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    /**
     * @return RestaurantOpeningHourDto[]
     */
    public function getOpeningHours(): array
    {
        return $this->openingHours;
    }
}
