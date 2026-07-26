<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\ActiveGroupOrdersRequest;

class ActiveGroupOrdersDto
{
    public function __construct(
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(ActiveGroupOrdersRequest $request): self
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
