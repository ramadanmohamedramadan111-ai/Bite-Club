<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\GroupOrderHistoryRequest;

class GroupOrderHistoryDto
{
    public function __construct(
        private readonly int $userId,
        private readonly ?int $groupId,
        private readonly int $page,
        private readonly int $perPage
    ) {}

    public static function fromValidatedRequest(GroupOrderHistoryRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['user_id'],
            isset($validated['group_id']) ? (int) $validated['group_id'] : null,
            (int) ($validated['page'] ?? 1),
            (int) ($validated['per_page'] ?? 15)
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getGroupId(): ?int
    {
        return $this->groupId;
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
