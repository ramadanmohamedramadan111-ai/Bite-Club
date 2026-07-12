<?php

namespace App\DTOs\Auth\Restaurant;

use App\Http\Requests\Auth\Restaurant\RestaurantRegisterRequest;

class RestaurantRegisterDto
{
    public function __construct(
        private string  $name,
        private string  $email,
        private string  $password,
        private string  $phoneNumber,
        private string  $address,
        private ?int    $categoryId,
        private ?string $description,
    ) {}

    public static function fromValidatedRequest(RestaurantRegisterRequest $request): self
    {
        $data = $request->validated();

        return new self(
            name:        $data['name'],
            email:       $data['email'],
            password:    $data['password'],
            phoneNumber: $data['phone_number'],
            address:     $data['address'],
            categoryId:  $data['category_id'] ?? null,
            description: $data['description'] ?? null,
        );
    }

    public function getName(): string        { return $this->name; }
    public function getEmail(): string       { return $this->email; }
    public function getPassword(): string    { return $this->password; }
    public function getPhoneNumber(): string { return $this->phoneNumber; }
    public function getAddress(): string     { return $this->address; }
    public function getCategoryId(): ?int    { return $this->categoryId; }
    public function getDescription(): ?string { return $this->description; }
}
