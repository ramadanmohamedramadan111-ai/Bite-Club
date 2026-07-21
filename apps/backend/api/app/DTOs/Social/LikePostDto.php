<?php

namespace App\DTOs\Social;

use App\Http\Requests\Social\LikePostRequest;

class LikePostDto
{
    public function __construct(
        private int $postId,
        private int $userId
    ) {}

    public static function fromValidatedRequest(LikePostRequest $request): self
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
