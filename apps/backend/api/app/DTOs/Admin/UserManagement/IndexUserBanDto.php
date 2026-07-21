<?php

namespace App\DTOs\Admin\UserManagement;

use App\Http\Requests\Admin\UserManagement\IndexUserBanRequest;

class IndexUserBanDto
{
    private ?string $username;
    private ?string $email;
    private ?string $search;
    private ?int $perPage;

    public function __construct(
        ?string $username = null,
        ?string $email = null,
        ?string $search = null,
        ?int $perPage = null
    ) {
        $this->username = $username;
        $this->email = $email;
        $this->search = $search;
        $this->perPage = $perPage;
    }

    public static function fromValidatedRequest(IndexUserBanRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['username'] ?? null,
            $data['email'] ?? null,
            $data['search'] ?? null,
            isset($data['per_page']) ? (int) $data['per_page'] : null
        );
    }

    public function toArray(): array
    {
        return [
            'username' => $this->username,
            'email'    => $this->email,
            'search'   => $this->search,
            'per_page' => $this->perPage,
        ];
    }
}
