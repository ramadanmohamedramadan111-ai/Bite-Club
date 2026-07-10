<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\AdminLoginRequest;

class AdminLoginDto
{
    private string $email;
    private string $password;

    public function __construct(string $email, string $password)
    {
        $this->email    = $email;
        $this->password = $password;
    }

    public static function fromValidatedRequest(AdminLoginRequest $request): self
    {
        $data = $request->validated();

        return new self($data['email'], $data['password']);
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
