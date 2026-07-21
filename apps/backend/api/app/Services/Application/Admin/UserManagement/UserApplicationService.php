<?php

namespace App\Services\Application\Admin\UserManagement;

use App\DTOs\Admin\UserManagement\IndexUserDto;
use App\Models\User;
use App\Services\Domain\Admin\UserManagement\UserDomainService;

class UserApplicationService
{
    public function __construct(
        private readonly UserDomainService $userDomainService
    ) {}

    public function index(IndexUserDto $dto): array
    {
        return $this->userDomainService->list($dto->toArray());
    }

    public function show(int $id): User
    {
        return $this->userDomainService->findOrFail($id);
    }

    public function stats(): array
    {
        return $this->userDomainService->getStats();
    }
}
