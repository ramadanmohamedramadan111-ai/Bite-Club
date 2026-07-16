<?php

namespace App\DTOs\User\Groups;

use App\Http\Requests\User\Groups\UpdateMemberRoleRequest;

class UpdateMemberRoleDto
{
    private string $role;

    public function __construct(string $role)
    {
        $this->role = $role;
    }

    public static function fromValidatedRequest(UpdateMemberRoleRequest $request): self
    {
        $data = $request->validated();
        return new self($data['role']);
    }

    public function getRole(): string
    {
        return $this->role;
    }
}
