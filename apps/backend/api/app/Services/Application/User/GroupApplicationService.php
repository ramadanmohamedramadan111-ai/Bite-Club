<?php

namespace App\Services\Application\User;

use App\DTOs\User\Groups\StoreGroupDto;
use App\DTOs\User\Groups\UpdateGroupDto;
use App\DTOs\User\Groups\UpdateJoinSettingsDto;
use App\DTOs\User\Groups\AddMemberDto;
use App\DTOs\User\Groups\UpdateMemberRoleDto;
use App\Models\Group;
use App\Services\Domain\User\GroupDomainService;
use App\Traits\FileUploadTrait;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class GroupApplicationService
{
    use FileUploadTrait;

    public function __construct(
        private GroupDomainService $groupDomainService
    ) {}

    public function createGroup(StoreGroupDto $dto): Group
    {
        $imageUrl = null;
        if ($dto->getImage()) {
            $imageUrl = $this->uploadFile($dto->getImage(), 'groups');
        }

        return $this->groupDomainService->createGroup(
            $dto->getName(),
            $dto->getDescription(),
            $imageUrl,
            $dto->getAllowJoinByLink()
        );
    }

    public function updateGroup(int $groupId, UpdateGroupDto $dto): Group
    {
        // Fetch to check ownership and active status before file operations
        $group = $this->groupDomainService->getGroup($groupId);

        $imageUrl = null;
        if ($dto->getImage()) {
            $imageUrl = $this->uploadFile($dto->getImage(), 'groups');
            if ($group->image_url) {
                $this->deleteFile($group->image_url);
            }
        }

        return $this->groupDomainService->updateGroup($groupId, $dto->toArray(), $imageUrl);
    }

    public function archiveGroup(int $groupId): Group
    {
        return $this->groupDomainService->archiveGroup($groupId);
    }

    public function listGroups(?string $search = null, int $perPage = 15, ?string $status = null): LengthAwarePaginator
    {
        return $this->groupDomainService->listGroups($search, $perPage, $status);
    }

    public function getGroup(int $groupId): Group
    {
        return $this->groupDomainService->getGroup($groupId);
    }

    public function listMembers(int $groupId, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->groupDomainService->listMembers($groupId, $search, $perPage);
    }

    public function listInvitableFriends(int $groupId, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->groupDomainService->listInvitableFriends($groupId, $search, $perPage);
    }

    public function addMember(int $groupId, AddMemberDto $dto): void
    {
        $this->groupDomainService->addMember($groupId, $dto->getUserId());
    }

    public function removeMember(int $groupId, int $targetUserId): void
    {
        $this->groupDomainService->removeMember($groupId, $targetUserId);
    }

    public function updateMemberRole(int $groupId, int $targetUserId, UpdateMemberRoleDto $dto): void
    {
        $this->groupDomainService->updateMemberRole($groupId, $targetUserId, $dto->getRole());
    }

    public function leaveGroup(int $groupId): void
    {
        $this->groupDomainService->leaveGroup($groupId);
    }

    public function showInvite(string $token): Group
    {
        return $this->groupDomainService->validateInvite($token);
    }

    public function joinByInvite(string $token): Group
    {
        return $this->groupDomainService->joinByInvite($token);
    }

    public function updateJoinSettings(int $groupId, UpdateJoinSettingsDto $dto): Group
    {
        return $this->groupDomainService->updateJoinSettings($groupId, $dto->getAllowJoinByLink());
    }

    public function regenerateInviteToken(int $groupId): Group
    {
        return $this->groupDomainService->regenerateInviteToken($groupId);
    }
}
