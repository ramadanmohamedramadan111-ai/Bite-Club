<?php

namespace App\Services\Domain\Admin\UserManagement;

use App\Enums\Auth\UserStatusEnum;
use App\Models\UserBan;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\UserBanRepositoryInterface;
use DomainException;
use Illuminate\Support\Facades\DB;

class UserBanDomainService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly UserBanRepositoryInterface $userBanRepository
    ) {}

    public function listActive(array $filters): array
    {
        return $this->userBanRepository->listActiveBans($filters);
    }

    public function findOrFail(int $id): UserBan
    {
        return $this->userBanRepository->findOrFail($id)->load(['user', 'bannedBy', 'liftedBy']);
    }

    public function ban(int $userId, string $reason, int $adminId): UserBan
    {
        return DB::transaction(function () use ($userId, $reason, $adminId) {
            $user = $this->userRepository->findOrFail($userId);

            if ($user->status === UserStatusEnum::BANNED) {
                throw new DomainException('User is already banned.');
            }

            // Create ban record
            $ban = $this->userBanRepository->create([
                'user_id'            => $userId,
                'reason'             => $reason,
                'banned_by_admin_id' => $adminId,
                'banned_at'          => now(),
            ]);

            // Update user status
            $this->userRepository->update($userId, [
                'status' => UserStatusEnum::BANNED->value,
            ]);

            return $ban->load(['user', 'bannedBy']);
        });
    }

    public function lift(int $banId, ?string $reason, int $adminId): UserBan
    {
        return DB::transaction(function () use ($banId, $reason, $adminId) {
            $ban = $this->userBanRepository->findOrFail($banId);

            if ($ban->lifted_at !== null) {
                throw new DomainException('The selected ban is already lifted.');
            }

            // Update ban record
            $this->userBanRepository->update($banId, [
                'lifted_by_admin_id' => $adminId,
                'lifted_reason'      => $reason,
                'lifted_at'          => now(),
            ]);

            // Update user status back to active
            $this->userRepository->update($ban->user_id, [
                'status' => UserStatusEnum::ACTIVE->value,
            ]);

            return $this->userBanRepository->findOrFail($banId)->load(['user', 'bannedBy', 'liftedBy']);
        });
    }
}
