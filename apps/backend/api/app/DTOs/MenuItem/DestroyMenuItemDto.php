<?php

namespace App\DTOs\MenuItem;

use App\Http\Requests\MenuItem\DestroyMenuItemRequest;

class DestroyMenuItemDto
{
    private int $id;
    private int $restaurantId;

    public function __construct(int $id, int $restaurantId)
    {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
    }

    public static function fromValidatedRequest(DestroyMenuItemRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['id'],
            auth('restaurant')->id()
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
}
