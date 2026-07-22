<?php

namespace App\DTOs\User;

use App\Http\Requests\User\UpdateProfileRequest;
use Illuminate\Http\UploadedFile;

class UpdateProfileDto
{
    public function __construct(
        private ?string $firstName,
        private ?string $lastName,
        private ?string $username,
        private ?UploadedFile $profileImage
    ) {}

    public static function fromValidatedRequest(UpdateProfileRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['first_name'] ?? null,
            $data['last_name'] ?? null,
            $data['username'] ?? null,
            $request->file('profile_image')
        );
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function getProfileImage(): ?UploadedFile
    {
        return $this->profileImage;
    }

    public function toArray(): array
    {
        $arr = [];
        if ($this->firstName !== null) {
            $arr['first_name'] = $this->firstName;
        }
        if ($this->lastName !== null) {
            $arr['last_name'] = $this->lastName;
        }
        if ($this->username !== null) {
            $arr['username'] = $this->username;
        }
        return $arr;
    }
}
