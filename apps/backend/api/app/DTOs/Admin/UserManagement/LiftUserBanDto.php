<?php

namespace App\DTOs\Admin\UserManagement;

use App\Http\Requests\Admin\UserManagement\LiftUserBanRequest;

class LiftUserBanDto
{
    private ?string $reason;

    public function __construct(?string $reason = null)
    {
        $this->reason = $reason;
    }

    public static function fromValidatedRequest(LiftUserBanRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['reason'] ?? null
        );
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function toArray(): array
    {
        return [
            'reason' => $this->reason,
        ];
    }
}
