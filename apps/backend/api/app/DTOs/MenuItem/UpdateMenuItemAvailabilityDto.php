<?php

namespace App\DTOs\MenuItem;

use App\Http\Requests\MenuItem\UpdateMenuItemAvailabilityRequest;

class UpdateMenuItemAvailabilityDto
{
    private int $id;
    private int $restaurantId;
    private string $availability;

    public function __construct(int $id, int $restaurantId, string $availability)
    {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
        $this->availability = $availability;
    }

    public static function fromValidatedRequest(UpdateMenuItemAvailabilityRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['id'],
            auth('restaurant')->id(),
            $data['availability']
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function toArray(): array
    {
        return [
            'availability' => $this->availability,
        ];
    }
}
