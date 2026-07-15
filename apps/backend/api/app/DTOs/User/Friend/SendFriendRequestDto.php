<?php

namespace App\DTOs\User\Friend;

use App\Http\Requests\User\Friend\SendFriendRequest;

class SendFriendRequestDto
{
    private int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public static function fromValidatedRequest(SendFriendRequest $request): self
    {
        $data = $request->validated();
        return new self((int) $data['user_id']);
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }
}
