<?php

namespace App\DTOs\RestaurantAuth;

use App\Http\Requests\RestaurantAuth\ResetPasswordRequest;

class ResetPasswordDto
{
    private string $email;
    private string $token;
    private string $password;

    public function __construct(string $email, string $token, string $password)
    {
        $this->email = $email;
        $this->token = $token;
        $this->password = $password;
    }

    public static function fromValidatedRequest(ResetPasswordRequest $request): self
    {
        $data = $request->validated();
        return new self($data['email'], $data['token'], $data['password']);
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}
