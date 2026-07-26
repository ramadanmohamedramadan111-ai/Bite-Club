<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Enums\Auth\AdminStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class UpdateAdminProfileTest extends TestCase
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

    public function test_guest_cannot_update_profile(): void
    {
        $response = $this->patchJson('/api/admin/profile', [
            'name'  => 'New Name',
            'email' => 'new@admin.com',
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_update_own_profile(): void
    {
        $admin = Admin::factory()->create([
            'name'          => 'Old Name',
            'email'         => 'old@admin.com',
            'status'        => AdminStatusEnum::ACTIVE,
            'last_login_at' => now()->subDay(),
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        $response = $this->patchJson('/api/admin/profile', [
            'name'  => 'New Name',
            'email' => 'new@admin.com',
        ], $headers);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => [
                'id'    => $admin->id,
                'name'  => 'New Name',
                'email' => 'new@admin.com',
                'status' => 'active',
            ],
        ]);

        $this->assertDatabaseHas('admins', [
            'id'    => $admin->id,
            'name'  => 'New Name',
            'email' => 'new@admin.com',
        ]);
    }

    public function test_admin_can_update_only_name(): void
    {
        $admin = Admin::factory()->create([
            'name'  => 'Old Name',
            'email' => 'admin@admin.com',
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        $response = $this->patchJson('/api/admin/profile', [
            'name' => 'New Name',
        ], $headers);

        $response->assertOk();
        $response->assertJsonPath('data.name', 'New Name');
        $response->assertJsonPath('data.email', 'admin@admin.com');

        $this->assertDatabaseHas('admins', [
            'id'    => $admin->id,
            'name'  => 'New Name',
            'email' => 'admin@admin.com',
        ]);
    }

    public function test_admin_can_update_only_email(): void
    {
        $admin = Admin::factory()->create([
            'name'  => 'Admin Name',
            'email' => 'old@admin.com',
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        $response = $this->patchJson('/api/admin/profile', [
            'email' => 'new@admin.com',
        ], $headers);

        $response->assertOk();
        $response->assertJsonPath('data.name', 'Admin Name');
        $response->assertJsonPath('data.email', 'new@admin.com');

        $this->assertDatabaseHas('admins', [
            'id'    => $admin->id,
            'name'  => 'Admin Name',
            'email' => 'new@admin.com',
        ]);
    }

    public function test_admin_cannot_use_existing_email_from_another_admin(): void
    {
        $admin1 = Admin::factory()->create(['email' => 'admin1@admin.com']);
        $admin2 = Admin::factory()->create(['email' => 'admin2@admin.com']);

        $headers = $this->getHeadersForAdmin($admin1);

        $response = $this->patchJson('/api/admin/profile', [
            'name'  => 'New Name',
            'email' => 'admin2@admin.com',
        ], $headers);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_update_profile_with_same_email(): void
    {
        $admin = Admin::factory()->create(['email' => 'admin@admin.com', 'name' => 'Name']);

        $headers = $this->getHeadersForAdmin($admin);

        $response = $this->patchJson('/api/admin/profile', [
            'name'  => 'Updated Name',
            'email' => 'admin@admin.com',
        ], $headers);

        $response->assertOk();
        $this->assertDatabaseHas('admins', [
            'id'    => $admin->id,
            'name'  => 'Updated Name',
            'email' => 'admin@admin.com',
        ]);
    }

    public function test_profile_update_does_not_modify_protected_fields(): void
    {
        $admin = Admin::factory()->create([
            'name'          => 'Admin Name',
            'email'         => 'admin@admin.com',
            'status'        => AdminStatusEnum::ACTIVE,
            'password_hash' => 'old_hash',
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        $response = $this->patchJson('/api/admin/profile', [
            'name'          => 'Updated Name',
            'email'         => 'admin@admin.com',
            'status'        => 'inactive',
            'password'      => 'new_password',
            'password_hash' => 'new_hash',
        ], $headers);

        $response->assertOk();

        // Fresh database fetch
        $updatedAdmin = Admin::findOrFail($admin->id);

        $this->assertEquals(AdminStatusEnum::ACTIVE, $updatedAdmin->status);
        $this->assertEquals('old_hash', $updatedAdmin->password_hash);
    }
}
