<?php

namespace App\DTOs\User\Order;

use App\Http\Requests\User\Order\PastOrdersRequest;

class PastOrdersDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $page,
        private readonly int $perPage
    ) {}

    public static function fromValidatedRequest(PastOrdersRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['user_id'],
            (int) ($validated['page'] ?? 1),
            (int) ($validated['per_page'] ?? 15)
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }
}
