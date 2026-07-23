<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\CreateGroupOrderRequest;

class CreateGroupOrderDto
{
    public function __construct(
        private readonly int $hostId,
        private readonly int $groupId,
        private readonly int $restaurantId,
    ) {}

    public static function fromValidatedRequest(CreateGroupOrderRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            hostId: (int) $validated['host_id'],
            groupId: (int) $validated['group_id'],
            restaurantId: (int) $validated['restaurant_id']
        );
    }

    public function getHostId(): int
    {
        return $this->hostId;
    }

    public function getGroupId(): int
    {
        return $this->groupId;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
