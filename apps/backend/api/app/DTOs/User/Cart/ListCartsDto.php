<?php

namespace App\DTOs\User\Cart;

use Illuminate\Http\Request;

class ListCartsDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(Request $request): self
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
