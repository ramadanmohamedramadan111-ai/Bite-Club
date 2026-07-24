<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\UnlockGroupOrderRequest;

class UnlockGroupOrderDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
    ) {}

    public static function fromValidatedRequest(UnlockGroupOrderRequest $request): self
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
