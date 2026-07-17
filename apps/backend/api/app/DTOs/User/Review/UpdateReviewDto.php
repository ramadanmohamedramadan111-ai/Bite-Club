<?php

namespace App\DTOs\User\Review;

use App\Http\Requests\User\Review\UpdateReviewRequest;

class UpdateReviewDto
{
    private array $data;

    public function __construct(
        private int $userId,
        private int $restaurantId,
        array $data
    ) {
        $this->data = $data;
    }

    public static function fromValidatedRequest(UpdateReviewRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['user_id'],
            (int) $data['restaurant_id'],
            $data
        );
    }

    public function getUserId(): int { return $this->userId; }
    public function getRestaurantId(): int { return $this->restaurantId; }
    public function getData(): array { return $this->data; }
}
