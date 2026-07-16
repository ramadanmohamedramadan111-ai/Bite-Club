<?php

namespace App\DTOs\User\Review;

use App\Http\Requests\User\Review\GetMyReviewRequest;

class GetMyReviewDto
{
    public function __construct(
        private int $userId,
        private int $restaurantId
    ) {}

    public static function fromValidatedRequest(GetMyReviewRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['user_id'],
            (int) $data['restaurant_id']
        );
    }

    public function getUserId(): int { return $this->userId; }
    public function getRestaurantId(): int { return $this->restaurantId; }
}
