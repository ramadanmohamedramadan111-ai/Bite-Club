<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\UpdateGroupOrderItemQuantityRequest;

class UpdateGroupOrderItemQuantityDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
        private readonly int $groupOrderItemId,
        private readonly int $quantity,
    ) {}

    public static function fromValidatedRequest(UpdateGroupOrderItemQuantityRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $validated['user_id'],
            groupOrderId: (int) $validated['group_order_id'],
            groupOrderItemId: (int) $validated['group_order_item_id'],
            quantity: (int) $validated['quantity']
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

    public function getQuantity(): int
    {
        return $this->quantity;
    }
}
