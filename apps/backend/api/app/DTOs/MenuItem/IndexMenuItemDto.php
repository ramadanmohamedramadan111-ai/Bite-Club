<?php

namespace App\DTOs\MenuItem;

use App\Http\Requests\MenuItem\IndexMenuItemRequest;

class IndexMenuItemDto
{
    private array $filters;
    private int $restaurantId;

    public function __construct(array $filters, int $restaurantId)
    {
        $this->filters = $filters;
        $this->restaurantId = $restaurantId;
    }

    public static function fromValidatedRequest(IndexMenuItemRequest $request): self
    {
        return new self(
            $request->validated(),
            auth('restaurant')->id()
        );
    }

    public function getFilters(): array
    {
        return $this->filters;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
