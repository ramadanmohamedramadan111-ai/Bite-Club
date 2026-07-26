<?php

namespace App\DTOs\Admin;

use App\Http\Requests\Admin\UpdateAdminProfileRequest;

class UpdateAdminProfileDto
{
    private ?string $name;
    private ?string $email;

    public function __construct(?string $name, ?string $email)
    {
        $this->name  = $name;
        $this->email = $email;
    }

    public static function fromValidatedRequest(UpdateAdminProfileRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['name'] ?? null,
            $data['email'] ?? null
        );
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }
}
