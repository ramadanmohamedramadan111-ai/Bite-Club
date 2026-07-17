<?php

namespace App\DTOs\User\Restaurant;

use Illuminate\Http\Request;

class ListMenuDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly ?string $itemTitle = null,
        private readonly ?string $category = null,
        private readonly ?int $perPage = 15,
        private readonly array $filters = []
    ) {}

    public static function fromValidatedRequest(Request $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['restaurant_id'],
            $validated['item_title'] ?? null,
            $validated['category'] ?? null,
            $validated['per_page'] ?? 15,
            $validated
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getFilters(): array
    {
        return $this->filters;
    }
}
