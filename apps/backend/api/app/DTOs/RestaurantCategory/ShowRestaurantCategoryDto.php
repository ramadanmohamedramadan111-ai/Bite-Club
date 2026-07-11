<?php

namespace App\DTOs\RestaurantCategory;

use App\Http\Requests\RestaurantCategory\ShowRestaurantCategoryRequest;

class ShowRestaurantCategoryDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(ShowRestaurantCategoryRequest $request): self
    {
        return new self((int) $request->route('id'));
    }

    public function getId(): int
    {
        return $this->id;
    }
}
