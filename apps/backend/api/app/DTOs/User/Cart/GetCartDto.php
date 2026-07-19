<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\GetCartRequest;

class GetCartDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(GetCartRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id']
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }
}
