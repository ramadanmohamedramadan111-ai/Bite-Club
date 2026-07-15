<?php

namespace App\DTOs\User\RestaurantCategory;

use App\Http\Requests\User\RestaurantCategory\IndexRestaurantCategoryRequest;

class IndexRestaurantCategoryDto
{
    public static function fromValidatedRequest(IndexRestaurantCategoryRequest $request): self
    {
        return new self();
    }

    public function toArray(): array
    {
        return [
            'all' => true,
        ];
    }
}
