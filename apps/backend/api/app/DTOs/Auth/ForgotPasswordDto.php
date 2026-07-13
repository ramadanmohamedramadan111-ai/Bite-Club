<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\ForgotPasswordRequest;

class ForgotPasswordDto
{
    public function __construct(
        private string $email
    ) {}

    public static function fromValidatedRequest(ForgotPasswordRequest $request): self
    {
        return new self(
            $request->validated('email')
        );
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
