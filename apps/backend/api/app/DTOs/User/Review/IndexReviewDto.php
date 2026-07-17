<?php

namespace App\DTOs\User\Review;

use App\Http\Requests\User\Review\IndexReviewRequest;

class IndexReviewDto
{
    public function __construct(
        private int $restaurantId,
        private array $filters
    ) {}

    public static function fromValidatedRequest(IndexReviewRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['restaurant_id'],
            $request->only(['per_page'])
        );
    }

    public function getRestaurantId(): int { return $this->restaurantId; }
    public function getFilters(): array { return $this->filters; }
}
