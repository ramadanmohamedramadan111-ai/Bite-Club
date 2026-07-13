<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\ResetPasswordRequest;

class ResetPasswordDto
{
    public function __construct(
        private string $email,
        private string $password
    ) {}

    public static function fromValidatedRequest(ResetPasswordRequest $request): self
    {
        return new self(
            $request->validated('email'),
            $request->validated('password')
        );
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}
