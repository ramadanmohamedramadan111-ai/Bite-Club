<?php

namespace App\DTOs\Social;

use App\Http\Requests\Admin\Social\ApprovePostRequest;

class ApprovePostDto
{
    public function __construct(
        private int $postId,
        private int $adminId
    ) {}

    public static function fromValidatedRequest(ApprovePostRequest $request): self
    {
        $validated = $request->validated();
        return new self(
            (int) $validated['post_id'],
            (int) $validated['admin_id']
        );
    }

    public function getPostId(): int { return $this->postId; }
    public function getAdminId(): int { return $this->adminId; }
}
