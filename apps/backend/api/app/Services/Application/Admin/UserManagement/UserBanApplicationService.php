<?php

namespace App\Services\Application\Admin\UserManagement;

use App\DTOs\Admin\UserManagement\IndexUserBanDto;
use App\DTOs\Admin\UserManagement\CreateUserBanDto;
use App\DTOs\Admin\UserManagement\LiftUserBanDto;
use App\Models\UserBan;
use App\Services\Domain\Admin\UserManagement\UserBanDomainService;

class UserBanApplicationService
{
    public function __construct(
        private readonly UserBanDomainService $userBanDomainService
    ) {}

    public function index(IndexUserBanDto $dto): array
    {
        return $this->userBanDomainService->listActive($dto->toArray());
    }

    public function ban(CreateUserBanDto $dto, int $adminId): UserBan
    {
        return $this->userBanDomainService->ban($dto->getUserId(), $dto->getReason(), $adminId);
    }

    public function show(int $id): UserBan
    {
        return $this->userBanDomainService->findOrFail($id);
    }

    public function lift(int $id, LiftUserBanDto $dto, int $adminId): UserBan
    {
        return $this->userBanDomainService->lift($id, $dto->getReason(), $adminId);
    }
}
