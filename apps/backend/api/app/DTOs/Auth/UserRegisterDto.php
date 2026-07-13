<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\UserRegisterRequest;

class UserRegisterDto
{
    private string $firstName;
    private string $lastName;
    private string $dateOfBirth;
    private string $username;
    private string $email;
    private string $phoneNumber;
    private string $password;
    private string $gender;
    private ?string $referrerCode;

    public function __construct(
        string $firstName,
        string $lastName,
        string $dateOfBirth,
        string $username,
        string $email,
        string $phoneNumber,
        string $password,
        string $gender,
        ?string $referrerCode = null
    ) {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->dateOfBirth = $dateOfBirth;
        $this->username = $username;
        $this->email = $email;
        $this->phoneNumber = $phoneNumber;
        $this->password = $password;
        $this->gender = $gender;
        $this->referrerCode = $referrerCode;
    }

    public static function fromValidatedRequest(UserRegisterRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['first_name'],
            $data['last_name'],
            $data['date_of_birth'],
            $data['username'],
            $data['email'],
            $data['phone_number'],
            $data['password'],
            $data['gender'],
            $data['referrer_code'] ?? null,
        );
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getDateOfBirth(): string
    {
        return $this->dateOfBirth;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPhoneNumber(): string
    {
        return $this->phoneNumber;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getGender(): string
    {
        return $this->gender;
    }

    public function getReferrerCode(): ?string
    {
        return $this->referrerCode;
    }
}
