<?php

namespace App\DTOs\User\Friend;

use App\Http\Requests\User\Friend\RejectFriendRequest;

class RejectFriendRequestDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(RejectFriendRequest $request): self
    {
        $data = $request->validated();
        return new self((int) $data['id']);
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
        ];
    }
}
