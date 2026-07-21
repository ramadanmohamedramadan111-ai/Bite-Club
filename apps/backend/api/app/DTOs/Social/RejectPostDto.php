<?php

namespace App\DTOs\Social;

use App\Http\Requests\Admin\Social\RejectPostRequest;

class RejectPostDto
{
    public function __construct(
        private int $postId,
        private int $adminId,
        private ?string $rejectionReason
    ) {}

    public static function fromValidatedRequest(RejectPostRequest $request): self
    {
        $validated = $request->validated();
        return new self(
            (int) $validated['post_id'],
            (int) $validated['admin_id'],
            $validated['rejection_reason'] ?? null
        );
    }

    public function getPostId(): int { return $this->postId; }
    public function getAdminId(): int { return $this->adminId; }
    public function getRejectionReason(): ?string { return $this->rejectionReason; }
}
