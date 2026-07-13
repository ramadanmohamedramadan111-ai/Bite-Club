<?php

namespace App\DTOs\Auth\Restaurant;

use App\Http\Requests\Auth\Restaurant\RestaurantLoginRequest;

class RestaurantLoginDto
{
    public function __construct(
        private string $email,
        private string $password,
    ) {}

    public static function fromValidatedRequest(RestaurantLoginRequest $request): self
    {
        $data = $request->validated();

        return new self(
            email:    $data['email'],
            password: $data['password'],
        );
    }

    public function getEmail(): string    { return $this->email; }
    public function getPassword(): string { return $this->password; }
}
