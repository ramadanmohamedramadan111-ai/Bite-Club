<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\ClearGroupOrderItemsRequest;

class ClearGroupOrderItemsDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId
    ) {}

    public static function fromValidatedRequest(ClearGroupOrderItemsRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['user_id'],
            (int) $validated['group_order_id']
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
