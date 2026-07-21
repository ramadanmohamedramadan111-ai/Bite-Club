<?php

namespace App\DTOs\Social;

use App\Http\Requests\Social\CreatePostRequest;

class CreatePostDto
{
    public function __construct(
        private int $userId,
        private int $orderId,
        private ?string $caption,
        private array $images
    ) {}

    public static function fromValidatedRequest(CreatePostRequest $request): self
    {
        $validated = $request->validated();
        return new self(
            (int) $validated['user_id'],
            (int) $validated['order_id'],
            $validated['caption'] ?? null,
            $validated['images'] ?? []
        );
    }

    public function getUserId(): int { return $this->userId; }
    public function getOrderId(): int { return $this->orderId; }
    public function getCaption(): ?string { return $this->caption; }
    public function getImages(): array { return $this->images; }
}
