<?php

namespace App\DTOs\MenuCategory;

use App\Http\Requests\MenuCategory\DestroyMenuCategoryRequest;

class DestroyMenuCategoryDto
{
    private int $id;
    private int $restaurantId;

    public function __construct(int $id, int $restaurantId)
    {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
    }

    public static function fromValidatedRequest(DestroyMenuCategoryRequest $request): self
    {
        return new self(
            $request->route('id'),
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
