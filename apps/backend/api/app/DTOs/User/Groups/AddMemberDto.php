<?php

namespace App\DTOs\User\Groups;

use App\Http\Requests\User\Groups\AddMemberRequest;

class AddMemberDto
{
    private int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public static function fromValidatedRequest(AddMemberRequest $request): self
    {
        $data = $request->validated();
        return new self((int) $data['user_id']);
    }

    public function getUserId(): int
    {
        return $this->userId;
    }
}
