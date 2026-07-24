<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\AddGroupOrderItemRequest;

class AddGroupOrderItemDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
        private readonly int $itemId,
        private readonly int $quantity,
        private readonly ?string $notes,
    ) {}

    public static function fromValidatedRequest(AddGroupOrderItemRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $validated['user_id'],
            groupOrderId: (int) $validated['group_order_id'],
            itemId: (int) $validated['item_id'],
            quantity: (int) $validated['quantity'],
            notes: $validated['notes'] ?? null
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

    public function getItemId(): int
    {
        return $this->itemId;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }
}
