<?php

namespace App\DTOs\Restaurant\Reviews;

use App\Http\Requests\Restaurant\Reviews\RestaurantReviewsRequest;

class RestaurantReviewsDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly int $page,
        private readonly int $perPage,
        private readonly ?int $rating,
        private readonly ?string $search
    ) {}

    public static function fromValidatedRequest(RestaurantReviewsRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['restaurant_id'],
            (int) ($validated['page'] ?? 1),
            (int) ($validated['per_page'] ?? 15),
            isset($validated['rating']) ? (int) $validated['rating'] : null,
            $validated['search'] ?? null
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function getSearch(): ?string
    {
        return $this->search;
    }
}
