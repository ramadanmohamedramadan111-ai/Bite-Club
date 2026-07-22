<?php

namespace App\DTOs\User\Order;

use App\Http\Requests\User\Order\ActiveOrdersRequest;

class ActiveOrdersDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(ActiveOrdersRequest $request): self
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
