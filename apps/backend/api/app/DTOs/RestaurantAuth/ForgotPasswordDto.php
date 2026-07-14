<?php

namespace App\DTOs\RestaurantAuth;

use App\Http\Requests\RestaurantAuth\ForgotPasswordRequest;

class ForgotPasswordDto
{
    private string $email;

    public function __construct(string $email)
    {
        $this->email = $email;
    }

    public static function fromValidatedRequest(ForgotPasswordRequest $request): self
    {
        return new self($request->validated('email'));
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
