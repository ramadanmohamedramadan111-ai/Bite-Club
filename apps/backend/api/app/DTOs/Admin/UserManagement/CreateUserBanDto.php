<?php

namespace App\DTOs\Admin\UserManagement;

use App\Http\Requests\Admin\UserManagement\CreateUserBanRequest;

class CreateUserBanDto
{
    private int $userId;
    private string $reason;

    public function __construct(int $userId, string $reason)
    {
        $this->userId = $userId;
        $this->reason = $reason;
    }

    public static function fromValidatedRequest(CreateUserBanRequest $request): self
    {
        $data = $request->validated();

        return new self(
            (int) $data['user_id'],
            $data['reason']
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getReason(): string
    {
        return $this->reason;
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'reason'  => $this->reason,
        ];
    }
}
