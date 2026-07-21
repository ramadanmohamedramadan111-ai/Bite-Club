<?php

namespace App\DTOs\Admin\UserManagement;

use App\Http\Requests\Admin\UserManagement\IndexUserRequest;

class IndexUserDto
{
    private ?string $username;
    private ?string $fullName;
    private ?string $email;
    private ?string $phoneNumber;
    private ?string $status;
    private ?int $perPage;

    public function __construct(
        ?string $username = null,
        ?string $fullName = null,
        ?string $email = null,
        ?string $phoneNumber = null,
        ?string $status = null,
        ?int $perPage = null
    ) {
        $this->username = $username;
        $this->fullName = $fullName;
        $this->email = $email;
        $this->phoneNumber = $phoneNumber;
        $this->status = $status;
        $this->perPage = $perPage;
    }

    public static function fromValidatedRequest(IndexUserRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['username'] ?? null,
            $data['full_name'] ?? null,
            $data['email'] ?? null,
            $data['phone_number'] ?? null,
            $data['status'] ?? null,
            isset($data['per_page']) ? (int) $data['per_page'] : null
        );
    }

    public function toArray(): array
    {
        return [
            'username'     => $this->username,
            'full_name'    => $this->fullName,
            'email'        => $this->email,
            'phone_number' => $this->phoneNumber,
            'status'       => $this->status,
            'per_page'     => $this->perPage,
        ];
    }
}
