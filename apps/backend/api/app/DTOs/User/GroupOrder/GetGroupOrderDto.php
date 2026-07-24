<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\GetGroupOrderRequest;

class GetGroupOrderDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
    ) {}

    public static function fromValidatedRequest(GetGroupOrderRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $validated['user_id'],
            groupOrderId: (int) $validated['group_order_id'],
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getGroupOrderId(): int
    {
        return $this->groupOrderId;
    }
}
