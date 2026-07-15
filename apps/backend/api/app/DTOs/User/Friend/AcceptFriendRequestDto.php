<?php

namespace App\DTOs\User\Friend;

use App\Http\Requests\User\Friend\AcceptFriendRequest;

class AcceptFriendRequestDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(AcceptFriendRequest $request): self
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
