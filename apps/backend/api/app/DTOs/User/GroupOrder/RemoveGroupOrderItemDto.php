<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\RemoveGroupOrderItemRequest;

class RemoveGroupOrderItemDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
        private readonly int $groupOrderItemId,
    ) {}

    public static function fromValidatedRequest(RemoveGroupOrderItemRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $validated['user_id'],
            groupOrderId: (int) $validated['group_order_id'],
            groupOrderItemId: (int) $validated['group_order_item_id']
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

    public function getGroupOrderItemId(): int
    {
        return $this->groupOrderItemId;
    }
}
