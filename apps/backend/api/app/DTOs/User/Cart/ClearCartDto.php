<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\ClearCartRequest;

class ClearCartDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(ClearCartRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['user_id']
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }
}
