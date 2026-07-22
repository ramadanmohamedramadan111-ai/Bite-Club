<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use App\Models\Order;
use App\Models\UserBan;
use App\Enums\Auth\UserStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class UserManagementTest extends TestCase
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

    public function test_admin_can_list_paginated_users(): void
    {
        $admin = Admin::factory()->create();
        User::factory()->count(20)->create();

        $response = $this->getJson('/api/admin/users', $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'items' => [
                    '*' => [
                        'id',
                        'username',
                        'full_name',
                        'email',
                        'phone_number',
                        'status',
                        'created_at',
                        'last_login_at',
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ]
            ]
        ]);

        $this->assertEquals(20, $response->json('data.meta.total'));
    }

    public function test_admin_can_search_users(): void
    {
        $admin = Admin::factory()->create();
        User::factory()->create([
            'username'     => 'searchuser',
            'first_name'   => 'John',
            'last_name'    => 'Doe',
            'email'        => 'john@example.com',
            'phone_number' => '01234567890',
        ]);
        User::factory()->create([
            'username'     => 'otheruser',
            'first_name'   => 'Jane',
            'last_name'    => 'Smith',
            'email'        => 'jane@example.com',
            'phone_number' => '01987654321',
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        // Search by username
        $response = $this->getJson('/api/admin/users?username=searchuser', $headers);
        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('searchuser', $response->json('data.items.0.username'));

        // Search by full name
        $response = $this->getJson('/api/admin/users?full_name=John Doe', $headers);
        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('searchuser', $response->json('data.items.0.username'));

        // Search by email
        $response = $this->getJson('/api/admin/users?email=jane@example.com', $headers);
        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('otheruser', $response->json('data.items.0.username'));

        // Search by phone number
        $response = $this->getJson('/api/admin/users?phone_number=01234567890', $headers);
        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('searchuser', $response->json('data.items.0.username'));
    }

    public function test_admin_can_filter_users_by_status(): void
    {
        $admin = Admin::factory()->create();
        User::factory()->create(['status' => UserStatusEnum::ACTIVE->value]);
        User::factory()->create(['status' => UserStatusEnum::BANNED->value]);

        $response = $this->getJson('/api/admin/users?status=banned', $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals(UserStatusEnum::BANNED->value, $response->json('data.items.0.status'));
    }

    public function test_admin_can_retrieve_single_user_details(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create();

        $response = $this->getJson("/api/admin/users/{$user->id}", $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'username',
                'first_name',
                'last_name',
                'full_name',
                'email',
                'phone_number',
                'profile_image_url',
                'gender',
                'date_of_birth',
                'referral_code',
                'referred_by',
                'failed_pickup_count',
                'status',
                'email_verified_at',
                'join_date',
                'last_login',
                'orders_count',
                'active_ban',
            ]
        ]);
    }

    public function test_admin_retrieves_user_ban_details_if_banned(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['status' => UserStatusEnum::BANNED->value]);
        
        $ban = UserBan::create([
            'user_id'            => $user->id,
            'reason'             => 'Rule violation',
            'banned_by_admin_id' => $admin->id,
            'banned_at'          => now(),
        ]);

        $response = $this->getJson("/api/admin/users/{$user->id}", $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertNotNull($response->json('data.active_ban'));
        $this->assertEquals('Rule violation', $response->json('data.active_ban.reason'));
        $this->assertEquals($admin->name, $response->json('data.active_ban.banned_by.name'));
    }

    public function test_admin_can_retrieve_user_dashboard_stats(): void
    {
        $admin = Admin::factory()->create();
        
        User::factory()->create(['email_verified_at' => now()]);
        User::factory()->create(['email_verified_at' => null]);
        User::factory()->create(['email_verified_at' => now(), 'created_at' => now()->subMonths(2)]);

        $response = $this->getJson('/api/admin/users/stats', $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'total_users',
                'new_users_this_month',
                'verified_users',
                'unverified_users',
            ]
        ]);

        $this->assertEquals(3, $response->json('data.total_users'));
        $this->assertEquals(2, $response->json('data.new_users_this_month'));
        $this->assertEquals(2, $response->json('data.verified_users'));
        $this->assertEquals(1, $response->json('data.unverified_users'));
    }
}
