<?php

namespace App\DTOs\Social;

use App\Http\Requests\Social\CopyOrderRequest;

class CopyOrderDto
{
    public function __construct(
        private int $postId,
        private int $userId
    ) {}

    public static function fromValidatedRequest(CopyOrderRequest $request): self
    {
        $validated = $request->validated();
        return new self(
            (int) $validated['post_id'],
            (int) $validated['user_id']
        );
    }

    public function getPostId(): int { return $this->postId; }
    public function getUserId(): int { return $this->userId; }
}
