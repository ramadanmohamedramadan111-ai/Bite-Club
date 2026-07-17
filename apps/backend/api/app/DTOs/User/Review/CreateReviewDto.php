<?php

namespace App\DTOs\User\Review;

use App\Http\Requests\User\Review\CreateReviewRequest;

class CreateReviewDto
{
    public function __construct(
        private int $userId,
        private int $restaurantId,
        private int $rating,
        private ?string $comment
    ) {}

    public static function fromValidatedRequest(CreateReviewRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['user_id'],
            (int) $data['restaurant_id'],
            (int) $data['rating'],
            $data['comment'] ?? null
        );
    }

    public function getUserId(): int { return $this->userId; }
    public function getRestaurantId(): int { return $this->restaurantId; }
    public function getRating(): int { return $this->rating; }
    public function getComment(): ?string { return $this->comment; }
}
