<?php

namespace App\Services\Domain\User;

use Exception;
use App\Models\User;
use App\Models\Group;
use App\Models\GroupMember;
use App\Enums\User\Groups\GroupStatusEnum;
use App\Enums\User\Groups\GroupMemberRoleEnum;
use App\Enums\User\Groups\GroupMemberStatusEnum;
use App\Repositories\Interfaces\User\GroupRepositoryInterface;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;
use App\Repositories\Interfaces\User\FriendshipRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Collection;

class GroupDomainService
{
    public function __construct(
        private GroupRepositoryInterface       $groupRepository,
        private GroupMemberRepositoryInterface $groupMemberRepository,
        private FriendshipRepositoryInterface  $friendshipRepository
    ) {}

    private function checkUserAuth(): User
    {
        $currentUser = Auth::guard('user')->user();
        if (!$currentUser) {
            throw new Exception("Unauthenticated.");
        }
        return $currentUser;
    }

    public function createGroup(string $name, ?string $description = null, ?string $imageUrl = null, bool $allowJoinByLink = true): Group
    {
        $currentUser = $this->checkUserAuth();

        // Generate unique token
        do {
            $token = Str::random(32);
        } while ($this->groupRepository->exists(['invite_token' => $token]));

        return DB::transaction(function () use ($currentUser, $name, $description, $imageUrl, $allowJoinByLink, $token) {
            $group = $this->groupRepository->create([
                'owner_user_id'      => $currentUser->id,
                'name'               => $name,
                'description'        => $description,
                'image_url'          => $imageUrl,
                'invite_token'       => $token,
                'allow_join_by_link' => $allowJoinByLink,
                'status'             => GroupStatusEnum::ACTIVE->value,
            ]);

            $this->groupMemberRepository->create([
                'group_id'  => $group->id,
                'user_id'   => $currentUser->id,
                'role'      => GroupMemberRoleEnum::OWNER->value,
                'status'    => GroupMemberStatusEnum::ACTIVE->value,
                'joined_at' => now(),
            ]);

            return $group;
        });
    }

    public function updateGroup(int $groupId, array $data, ?string $imageUrl = null): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->owner_user_id !== $currentUser->id) {
            throw new Exception("Unauthorized to edit this group.");
        }

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot be edited.");
        }

        $updateData = [];
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }
        if (isset($data['allow_join_by_link'])) {
            $updateData['allow_join_by_link'] = $data['allow_join_by_link'];
        }
        if ($imageUrl !== null) {
            $updateData['image_url'] = $imageUrl;
        }

        $this->groupRepository->update($groupId, $updateData);

        return $group->refresh();
    }

    public function archiveGroup(int $groupId): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->owner_user_id !== $currentUser->id) {
            throw new Exception("Unauthorized to archive this group.");
        }

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("This group is already archived.");
        }

        $this->groupRepository->update($groupId, [
            'status' => GroupStatusEnum::ARCHIVED->value,
        ]);

        return $group->refresh();
    }

    public function listGroups(?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $currentUser = $this->checkUserAuth();

        $query = $this->groupRepository->query()
            ->whereHas('members', function ($q) use ($currentUser) {
                $q->where('user_id', $currentUser->id)
                  ->where('group_members.status', GroupMemberStatusEnum::ACTIVE->value);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $query->with(['owner'])
              ->withCount(['members as active_members_count' => function ($q) {
                  $q->where('group_members.status', GroupMemberStatusEnum::ACTIVE->value);
              }]);

        return $query->paginate($perPage);
    }

    public function getGroup(int $groupId): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        $isMember = $this->groupMemberRepository->exists([
            'group_id' => $groupId,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$isMember) {
            throw new Exception("Unauthorized to view this group.");
        }

        $group->load(['owner', 'members' => function ($q) {
            $q->where('group_members.status', GroupMemberStatusEnum::ACTIVE->value);
        }]);

        return $group;
    }

    public function listMembers(int $groupId, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        $isMember = $this->groupMemberRepository->exists([
            'group_id' => $groupId,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$isMember) {
            throw new Exception("Unauthorized to view this group's members.");
        }

        $query = $group->members()
            ->where('group_members.status', GroupMemberStatusEnum::ACTIVE->value);
            
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function addMember(int $groupId, int $userId): void
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot accept new members.");
        }

        // Verify requester is owner or admin
        $requesterMembership = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$requesterMembership || !in_array($requesterMembership->role, [GroupMemberRoleEnum::OWNER, GroupMemberRoleEnum::ADMIN], true)) {
            throw new Exception("Unauthorized to add members to this group.");
        }

        // Verify requester and target are friends
        $lowId = min($currentUser->id, $userId);
        $highId = max($currentUser->id, $userId);
        $areFriends = $this->friendshipRepository->exists([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);

        if (!$areFriends) {
            throw new Exception("You can only add users who are your friends.");
        }

        // Check if target user is already an active member
        $existingMember = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $userId,
        ]);

        if ($existingMember && $existingMember->status === GroupMemberStatusEnum::ACTIVE) {
            throw new Exception("User is already a member of this group.");
        }

        DB::transaction(function () use ($existingMember, $groupId, $userId) {
            if ($existingMember) {
                $existingMember->update([
                    'status'    => GroupMemberStatusEnum::ACTIVE->value,
                    'role'      => GroupMemberRoleEnum::MEMBER->value,
                    'joined_at' => now(),
                    'left_at'   => null,
                ]);
            } else {
                $this->groupMemberRepository->create([
                    'group_id'  => $groupId,
                    'user_id'   => $userId,
                    'role'      => GroupMemberRoleEnum::MEMBER->value,
                    'status'    => GroupMemberStatusEnum::ACTIVE->value,
                    'joined_at' => now(),
                ]);
            }
        });
    }

    public function removeMember(int $groupId, int $targetUserId): void
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot be modified.");
        }

        // Verify target membership exists and is active
        $targetMembership = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $targetUserId,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$targetMembership) {
            throw new Exception("User is not an active member of this group.");
        }

        // Verify requester is owner or admin
        $requesterMembership = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$requesterMembership || !in_array($requesterMembership->role, [GroupMemberRoleEnum::OWNER, GroupMemberRoleEnum::ADMIN], true)) {
            throw new Exception("Unauthorized to remove members from this group.");
        }

        // Perform role hierarchy checks
        if ($requesterMembership->role === GroupMemberRoleEnum::OWNER) {
            if ($targetUserId === $currentUser->id) {
                throw new Exception("Owner cannot remove himself.");
            }
        } elseif ($requesterMembership->role === GroupMemberRoleEnum::ADMIN) {
            if ($targetMembership->role !== GroupMemberRoleEnum::MEMBER) {
                throw new Exception("Admins can only remove members.");
            }
        }

        $targetMembership->update([
            'status'  => GroupMemberStatusEnum::REMOVED->value,
            'left_at' => now(),
        ]);
    }

    public function updateMemberRole(int $groupId, int $targetUserId, string $newRole): void
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot be modified.");
        }

        // Only the owner can change member roles.
        if ($group->owner_user_id !== $currentUser->id) {
            throw new Exception("Unauthorized to change member roles.");
        }

        $targetMembership = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $targetUserId,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$targetMembership) {
            throw new Exception("User is not an active member of this group.");
        }

        // The owner role cannot be modified.
        if ($targetMembership->role === GroupMemberRoleEnum::OWNER) {
            throw new Exception("Owner role cannot be modified.");
        }

        if ($targetMembership->role->value === $newRole) {
            throw new Exception("User already has the requested role.");
        }

        // Only member -> admin and admin -> member transitions are allowed.
        $allowedNewRoles = [GroupMemberRoleEnum::ADMIN->value, GroupMemberRoleEnum::MEMBER->value];
        if (!in_array($newRole, $allowedNewRoles, true)) {
            throw new Exception("Invalid role modification.");
        }

        $targetMembership->update([
            'role' => $newRole,
        ]);
    }

    public function leaveGroup(int $groupId): void
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->owner_user_id === $currentUser->id) {
            throw new Exception("The owner cannot leave the group.");
        }

        $membership = $this->groupMemberRepository->first([
            'group_id' => $groupId,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if (!$membership) {
            throw new Exception("You are not an active member of this group.");
        }

        $membership->update([
            'status'  => GroupMemberStatusEnum::LEFT->value,
            'left_at' => now(),
        ]);
    }

    public function validateInvite(string $token): Group
    {
        $currentUser = $this->checkUserAuth();
        
        $group = $this->groupRepository->first(['invite_token' => $token]);
        if (!$group) {
            throw new ModelNotFoundException("Invite token not found.");
        }

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("This group is archived.");
        }

        if (!$group->allow_join_by_link) {
            throw new Exception("Joining by link is disabled for this group.");
        }

        $isMember = $this->groupMemberRepository->exists([
            'group_id' => $group->id,
            'user_id'  => $currentUser->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        if ($isMember) {
            throw new Exception("You are already a member of this group.");
        }

        return $group;
    }

    public function joinByInvite(string $token): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->validateInvite($token);

        $existingMember = $this->groupMemberRepository->first([
            'group_id' => $group->id,
            'user_id'  => $currentUser->id,
        ]);

        DB::transaction(function () use ($existingMember, $group, $currentUser) {
            if ($existingMember) {
                $existingMember->update([
                    'status'    => GroupMemberStatusEnum::ACTIVE->value,
                    'role'      => GroupMemberRoleEnum::MEMBER->value,
                    'joined_at' => now(),
                    'left_at'   => null,
                ]);
            } else {
                $this->groupMemberRepository->create([
                    'group_id'  => $group->id,
                    'user_id'   => $currentUser->id,
                    'role'      => GroupMemberRoleEnum::MEMBER->value,
                    'status'    => GroupMemberStatusEnum::ACTIVE->value,
                    'joined_at' => now(),
                ]);
            }
        });

        return $group;
    }

    public function updateJoinSettings(int $groupId, bool $allowJoinByLink): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->owner_user_id !== $currentUser->id) {
            throw new Exception("Unauthorized to change join settings.");
        }

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot be modified.");
        }

        $this->groupRepository->update($groupId, [
            'allow_join_by_link' => $allowJoinByLink,
        ]);

        return $group->refresh();
    }

    public function regenerateInviteToken(int $groupId): Group
    {
        $currentUser = $this->checkUserAuth();
        $group = $this->groupRepository->findOrFail($groupId);

        if ($group->owner_user_id !== $currentUser->id) {
            throw new Exception("Unauthorized to regenerate invite link.");
        }

        if ($group->status === GroupStatusEnum::ARCHIVED) {
            throw new Exception("Archived groups cannot be modified.");
        }

        do {
            $token = Str::random(32);
        } while ($this->groupRepository->exists(['invite_token' => $token]));

        $this->groupRepository->update($groupId, [
            'invite_token' => $token,
        ]);

        return $group->refresh();
    }
}
