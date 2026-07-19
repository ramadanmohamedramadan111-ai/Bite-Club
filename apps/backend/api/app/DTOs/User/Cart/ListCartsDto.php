<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\ListCartsRequest;

class ListCartsDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(ListCartsRequest $request): self
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
