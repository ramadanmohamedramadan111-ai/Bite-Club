<?php

namespace App\Services\Domain\Admin\UserManagement;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserDomainService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function list(array $filters): array
    {
        return $this->userRepository->listForAdmin($filters);
    }

    public function getStats(): array
    {
        return $this->userRepository->getDashboardStats();
    }

    public function findOrFail(int $id): User
    {
        $user = $this->userRepository->findOrFail($id);
        
        return $user->load(['activeBan.bannedBy']);
    }
}
