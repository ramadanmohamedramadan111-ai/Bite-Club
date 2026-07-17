<?php

namespace Tests\Feature\User;

use App\Models\User;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\Friendship;
use App\Enums\User\Groups\GroupStatusEnum;
use App\Enums\User\Groups\GroupMemberRoleEnum;
use App\Enums\User\Groups\GroupMemberStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class GroupsTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForUser(User $user): array
    {
        Auth::guard('user')->forgetUser();
        $token = JWTAuth::fromUser($user);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    private function establishFriendship(User $user1, User $user2): void
    {
        $lowId = min($user1->id, $user2->id);
        $highId = max($user1->id, $user2->id);
        Friendship::create([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);
    }

    public function test_authenticated_user_can_create_group(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $image = UploadedFile::fake()->create('group.jpg', 100, 'image/jpeg');

        $response = $this->postJson('/api/groups', [
            'name'               => 'Bite Club Core',
            'description'        => 'Organizing lunch orders',
            'image'              => $image,
            'allow_join_by_link' => true,
        ], $this->getHeadersForUser($user));

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Bite Club Core');
        $response->assertJsonPath('data.owner.id', $user->id);

        $this->assertDatabaseHas('groups', [
            'name'          => 'Bite Club Core',
            'owner_user_id' => $user->id,
            'status'        => GroupStatusEnum::ACTIVE->value,
        ]);

        $group = Group::first();
        $this->assertNotNull($group->invite_token);
        $this->assertNotNull($group->image_url);

        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $user->id,
            'role'     => GroupMemberRoleEnum::OWNER->value,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);
    }

    public function test_user_can_list_only_their_active_groups(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Group where user1 is owner
        $group1 = Group::factory()->create([
            'owner_user_id' => $user1->id,
            'name'          => 'Lunch Group',
            'invite_token'  => 'token1',
        ]);
        GroupMember::create([
            'group_id'  => $group1->id,
            'user_id'   => $user1->id,
            'role'      => GroupMemberRoleEnum::OWNER->value,
            'status'    => GroupMemberStatusEnum::ACTIVE->value,
            'joined_at' => now(),
        ]);

        // Group where user1 is member
        $group2 = Group::factory()->create([
            'owner_user_id' => $user2->id,
            'name'          => 'Dinner Group',
            'invite_token'  => 'token2',
        ]);
        GroupMember::create([
            'group_id'  => $group2->id,
            'user_id'   => $user2->id,
            'role'      => GroupMemberRoleEnum::OWNER->value,
            'status'    => GroupMemberStatusEnum::ACTIVE->value,
            'joined_at' => now(),
        ]);
        GroupMember::create([
            'group_id'  => $group2->id,
            'user_id'   => $user1->id,
            'role'      => GroupMemberRoleEnum::MEMBER->value,
            'status'    => GroupMemberStatusEnum::ACTIVE->value,
            'joined_at' => now(),
        ]);

        // Group that user1 has left
        $group3 = Group::factory()->create([
            'owner_user_id' => $user2->id,
            'name'          => 'Breakfast Group',
            'invite_token'  => 'token3',
        ]);
        GroupMember::create([
            'group_id'  => $group3->id,
            'user_id'   => $user1->id,
            'role'      => GroupMemberRoleEnum::MEMBER->value,
            'status'    => GroupMemberStatusEnum::LEFT->value,
            'joined_at' => now(),
        ]);

        $response = $this->getJson('/api/groups', $this->getHeadersForUser($user1));

        $response->assertOk();
        $response->assertJsonCount(2, 'data.items');
        $response->assertJsonPath('data.items.0.name', 'Lunch Group');
        $response->assertJsonPath('data.items.1.name', 'Dinner Group');
    }

    public function test_user_can_search_groups(): void
    {
        $user = User::factory()->create();

        $group1 = Group::factory()->create(['owner_user_id' => $user->id, 'name' => 'Pizza Lovers', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group1->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);

        $group2 = Group::factory()->create(['owner_user_id' => $user->id, 'name' => 'Burger Lovers', 'invite_token' => 'token2']);
        GroupMember::create(['group_id' => $group2->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);

        $response = $this->getJson('/api/groups?search=burger', $this->getHeadersForUser($user));

        $response->assertOk();
        $response->assertJsonCount(1, 'data.items');
        $response->assertJsonPath('data.items.0.name', 'Burger Lovers');
    }

    public function test_member_can_view_group_details(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $group = Group::factory()->create(['owner_user_id' => $user1->id, 'name' => 'Club Alpha', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $user1->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $user2->id, 'role' => 'member', 'status' => 'active']);

        // Active member views
        $response = $this->getJson("/api/groups/{$group->id}", $this->getHeadersForUser($user2));
        $response->assertOk();
        $response->assertJsonPath('data.name', 'Club Alpha');
        $response->assertJsonCount(2, 'data.members');
    }

    public function test_non_member_cannot_view_group_details(): void
    {
        $user1 = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_user_id' => $user1->id, 'name' => 'Club Alpha', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $user1->id, 'role' => 'owner', 'status' => 'active']);

        // Non-member views
        $response = $this->getJson("/api/groups/{$group->id}", $this->getHeadersForUser($nonMember));
        $response->assertStatus(500); // Throws Exception "Unauthorized to view this group."
    }

    public function test_owner_can_edit_group(): void
    {
        $owner = User::factory()->create();

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Original Name', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // Owner edits successfully
        $response = $this->patchJson("/api/groups/{$group->id}", [
            'name'        => 'Updated Name',
            'description' => 'Brand new desc'
        ], $this->getHeadersForUser($owner));

        $response->assertOk();
        $response->assertJsonPath('data.name', 'Updated Name');
        $this->assertDatabaseHas('groups', [
            'id'          => $group->id,
            'name'        => 'Updated Name',
            'description' => 'Brand new desc',
        ]);
    }

    public function test_non_owner_cannot_edit_group(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Original Name', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        // Member attempts edit
        $response = $this->patchJson("/api/groups/{$group->id}", [
            'name' => 'Hacked Name'
        ], $this->getHeadersForUser($member));
        $response->assertStatus(500);
    }

    public function test_owner_can_archive_group_which_blocks_modifications(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Original Name', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        $response = $this->deleteJson("/api/groups/{$group->id}", [], $this->getHeadersForUser($owner));
        $response->assertOk();
        $response->assertJsonPath('data.status', 'archived');

        $this->assertDatabaseHas('groups', [
            'id'     => $group->id,
            'status' => GroupStatusEnum::ARCHIVED->value,
        ]);

        // Attempt edit on archived group
        $response = $this->patchJson("/api/groups/{$group->id}", [
            'name' => 'New Name'
        ], $this->getHeadersForUser($owner));
        $response->assertStatus(500);
    }

    public function test_owner_can_manually_add_friend_and_remove_members(): void
    {
        $owner = User::factory()->create();
        $userToAdd = User::factory()->create();
        
        $this->establishFriendship($owner, $userToAdd);

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // Add member
        $response = $this->postJson("/api/groups/{$group->id}/members", [
            'user_id' => $userToAdd->id
        ], $this->getHeadersForUser($owner));

        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $userToAdd->id,
            'role'     => GroupMemberRoleEnum::MEMBER->value,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);

        // Remove member
        $response = $this->deleteJson("/api/groups/{$group->id}/members/{$userToAdd->id}", [], $this->getHeadersForUser($owner));
        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $userToAdd->id,
            'status'   => GroupMemberStatusEnum::REMOVED->value,
        ]);
    }

    public function test_admin_can_manually_add_friend(): void
    {
        $owner = User::factory()->create();
        $adminUser = User::factory()->create();
        $userToAdd = User::factory()->create();

        $this->establishFriendship($adminUser, $userToAdd);

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $adminUser->id, 'role' => 'admin', 'status' => 'active']);

        // Add member by admin
        $response = $this->postJson("/api/groups/{$group->id}/members", [
            'user_id' => $userToAdd->id
        ], $this->getHeadersForUser($adminUser));

        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $userToAdd->id,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);
    }

    public function test_member_cannot_manually_add_friend(): void
    {
        $owner = User::factory()->create();
        $memberUser = User::factory()->create();
        $userToAdd = User::factory()->create();

        $this->establishFriendship($memberUser, $userToAdd);

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $memberUser->id, 'role' => 'member', 'status' => 'active']);

        $response = $this->postJson("/api/groups/{$group->id}/members", [
            'user_id' => $userToAdd->id
        ], $this->getHeadersForUser($memberUser));

        $response->assertStatus(500); // Unauthorized to add members
    }

    public function test_cannot_add_non_friend_manually(): void
    {
        $owner = User::factory()->create();
        $userToAdd = User::factory()->create();

        // No friendship established

        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        $response = $this->postJson("/api/groups/{$group->id}/members", [
            'user_id' => $userToAdd->id
        ], $this->getHeadersForUser($owner));

        $response->assertStatus(500); // You can only add friends
    }

    public function test_member_can_leave_group(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        // Member leaves
        $response = $this->postJson("/api/groups/{$group->id}/leave", [], $this->getHeadersForUser($member));
        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $member->id,
            'status'   => GroupMemberStatusEnum::LEFT->value,
        ]);
    }

    public function test_owner_cannot_leave_group(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // Owner attempts to leave
        $response = $this->postJson("/api/groups/{$group->id}/leave", [], $this->getHeadersForUser($owner));
        $response->assertStatus(500);
    }

    public function test_user_can_view_invite_details_and_join_via_invite_token(): void
    {
        $owner = User::factory()->create();
        $joiningUser = User::factory()->create();
        $group = Group::factory()->create([
            'owner_user_id'      => $owner->id,
            'name'               => 'Public Club',
            'invite_token'       => 'secure_token_123',
            'allow_join_by_link' => true,
        ]);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // View invite
        $response = $this->getJson('/api/groups/invite/secure_token_123', $this->getHeadersForUser($joiningUser));
        $response->assertOk();
        $response->assertJsonPath('data.name', 'Public Club');

        // Join group (Note: no friendship required for invite joining)
        $response = $this->postJson('/api/groups/invite/secure_token_123', [], $this->getHeadersForUser($joiningUser));
        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $joiningUser->id,
            'role'     => GroupMemberRoleEnum::MEMBER->value,
            'status'   => GroupMemberStatusEnum::ACTIVE->value,
        ]);
    }

    public function test_cannot_join_group_when_join_by_link_is_disabled(): void
    {
        $owner = User::factory()->create();
        $joiningUser = User::factory()->create();
        $group = Group::factory()->create([
            'owner_user_id'      => $owner->id,
            'name'               => 'Private Club',
            'invite_token'       => 'secure_token_123',
            'allow_join_by_link' => false,
        ]);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        $response = $this->postJson('/api/groups/invite/secure_token_123', [], $this->getHeadersForUser($joiningUser));
        $response->assertStatus(500); // Throws Exception "Joining by link is disabled for this group."
    }

    public function test_owner_can_regenerate_invite_link_and_update_join_settings(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create([
            'owner_user_id'      => $owner->id,
            'name'               => 'Join Settings Club',
            'invite_token'       => 'token1',
            'allow_join_by_link' => true,
        ]);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // Update join settings
        $response = $this->patchJson("/api/groups/{$group->id}/join-settings", [
            'allow_join_by_link' => false,
        ], $this->getHeadersForUser($owner));

        $response->assertOk();
        $this->assertDatabaseHas('groups', [
            'id'                 => $group->id,
            'allow_join_by_link' => false,
        ]);

        // Regenerate invite link
        $response = $this->postJson("/api/groups/{$group->id}/regenerate-link", [], $this->getHeadersForUser($owner));
        $response->assertOk();
        $newToken = $response->json('data.invite_token');
        $this->assertNotEquals('token1', $newToken);
    }

    public function test_owner_can_promote_member_to_admin(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Club Omega', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        $response = $this->patchJson("/api/groups/{$group->id}/members/{$member->id}", [
            'role' => 'admin'
        ], $this->getHeadersForUser($owner));

        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $member->id,
            'role'     => GroupMemberRoleEnum::ADMIN->value,
        ]);
    }

    public function test_owner_can_demote_admin_to_member(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Club Omega', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin->id, 'role' => 'admin', 'status' => 'active']);

        $response = $this->patchJson("/api/groups/{$group->id}/members/{$admin->id}", [
            'role' => 'member'
        ], $this->getHeadersForUser($owner));

        $response->assertOk();
        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $admin->id,
            'role'     => GroupMemberRoleEnum::MEMBER->value,
        ]);
    }

    public function test_non_owner_cannot_change_member_roles(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Club Omega', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin->id, 'role' => 'admin', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        // Admin attempts role change
        $response = $this->patchJson("/api/groups/{$group->id}/members/{$member->id}", [
            'role' => 'admin'
        ], $this->getHeadersForUser($admin));

        $response->assertStatus(500); // Unauthorized to change roles
    }

    public function test_cannot_change_role_to_same_role(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Club Omega', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        // Try changing member to member
        $response = $this->patchJson("/api/groups/{$group->id}/members/{$member->id}", [
            'role' => 'member'
        ], $this->getHeadersForUser($owner));

        $response->assertStatus(500); // Already has the requested role
    }

    public function test_owner_role_cannot_be_modified(): void
    {
        $owner = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Club Omega', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);

        // Owner attempts to change own role
        $response = $this->patchJson("/api/groups/{$group->id}/members/{$owner->id}", [
            'role' => 'admin'
        ], $this->getHeadersForUser($owner));

        $response->assertStatus(500); // Owner role cannot be modified
    }

    public function test_admin_can_remove_member(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin->id, 'role' => 'admin', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $member->id, 'role' => 'member', 'status' => 'active']);

        $response = $this->deleteJson("/api/groups/{$group->id}/members/{$member->id}", [], $this->getHeadersForUser($admin));
        $response->assertOk();

        $this->assertDatabaseHas('group_members', [
            'group_id' => $group->id,
            'user_id'  => $member->id,
            'status'   => GroupMemberStatusEnum::REMOVED->value,
        ]);
    }

    public function test_admin_cannot_remove_another_admin(): void
    {
        $owner = User::factory()->create();
        $admin1 = User::factory()->create();
        $admin2 = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin1->id, 'role' => 'admin', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin2->id, 'role' => 'admin', 'status' => 'active']);

        $response = $this->deleteJson("/api/groups/{$group->id}/members/{$admin2->id}", [], $this->getHeadersForUser($admin1));
        $response->assertStatus(500); // Admins can only remove members
    }

    public function test_admin_cannot_remove_owner(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $owner->id, 'name' => 'Core Club', 'invite_token' => 'token1']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active']);
        GroupMember::create(['group_id' => $group->id, 'user_id' => $admin->id, 'role' => 'admin', 'status' => 'active']);

        $response = $this->deleteJson("/api/groups/{$group->id}/members/{$owner->id}", [], $this->getHeadersForUser($admin));
        $response->assertStatus(500); // Admins can only remove members
    }
}
