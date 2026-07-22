<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use App\Models\UserBan;
use App\Enums\Auth\UserStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class UserBanManagementTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForAdmin(Admin $admin): array
    {
        $token = JWTAuth::fromUser($admin);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_admin_can_list_active_bans(): void
    {
        $admin = Admin::factory()->create();
        
        $user1 = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);
        $user2 = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);
        
        UserBan::create([
            'user_id'            => $user1->id,
            'reason'             => 'Spamming',
            'banned_by_admin_id' => $admin->id,
            'banned_at'          => now(),
        ]);
        
        UserBan::create([
            'user_id'            => $user2->id,
            'reason'             => 'Abusive language',
            'banned_by_admin_id' => $admin->id,
            'banned_at'          => now(),
        ]);

        $response = $this->getJson('/api/admin/user-bans', $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $this->assertCount(2, $response->json('data.items'));
        $response->assertJsonStructure([
            'success',
            'data' => [
                'items' => [
                    '*' => [
                        'id',
                        'reason',
                        'banned_at',
                        'lifted_at',
                        'user' => ['id', 'username', 'full_name', 'email'],
                        'banned_by' => ['id', 'name', 'email'],
                    ]
                ],
                'meta'
            ]
        ]);
    }

    public function test_admin_can_ban_a_user(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['status' => UserStatusEnum::ACTIVE->value]);

        $response = $this->postJson('/api/admin/user-bans', [
            'user_id' => $user->id,
            'reason'  => 'Repeated misbehavior',
        ], $this->getHeadersForAdmin($admin));

        $response->assertCreated();
        $response->assertJsonPath('data.reason', 'Repeated misbehavior');

        $this->assertDatabaseHas('user_bans', [
            'user_id'            => $user->id,
            'reason'             => 'Repeated misbehavior',
            'banned_by_admin_id' => $admin->id,
        ]);

        $user->refresh();
        $this->assertEquals(UserStatusEnum::BANNED, $user->status);
    }

    public function test_admin_cannot_ban_already_banned_user(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);

        $response = $this->postJson('/api/admin/user-bans', [
            'user_id' => $user->id,
            'reason'  => 'Another reason',
        ], $this->getHeadersForAdmin($admin));

        $response->assertStatus(422);
    }

    public function test_admin_can_retrieve_single_ban_details(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);
        
        $ban = UserBan::create([
            'user_id'            => $user->id,
            'reason'             => 'Some reason',
            'banned_by_admin_id' => $admin->id,
            'banned_at'          => now(),
        ]);

        $response = $this->getJson("/api/admin/user-bans/{$ban->id}", $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $this->assertEquals('Some reason', $response->json('data.reason'));
    }

    public function test_admin_can_lift_an_active_ban(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);
        
        $ban = UserBan::create([
            'user_id'            => $user->id,
            'reason'             => 'Some reason',
            'banned_by_admin_id' => $admin->id,
            'banned_at'          => now(),
        ]);

        $response = $this->patchJson("/api/admin/user-bans/{$ban->id}/lift", [
            'reason' => 'Apology accepted',
        ], $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $this->assertNotNull($response->json('data.lifted_at'));
        $this->assertEquals('Apology accepted', $response->json('data.lifted_reason'));
        $this->assertEquals($admin->name, $response->json('data.lifted_by.name'));

        $user->refresh();
        $this->assertEquals(UserStatusEnum::ACTIVE, $user->status);
    }
}
