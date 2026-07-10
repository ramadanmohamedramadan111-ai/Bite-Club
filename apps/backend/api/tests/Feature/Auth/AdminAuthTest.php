<?php

namespace Tests\Feature\Auth;

use App\Enums\Auth\AdminStatusEnum;
use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_receive_token_payload(): void
    {
        $admin = $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'access_token',
                'token_type',
                'expires_in',
            ],
        ]);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('auth.login_success'));
        $response->assertJsonPath('data.token_type', 'Bearer');
        $response->assertJsonPath('data.expires_in', config('jwt.ttl') * 60);

        $accessToken = $response->json('data.access_token');
        $this->assertIsString($accessToken);
        $this->assertNotSame('', $accessToken);

        $admin->refresh();
        $this->assertNotNull($admin->last_login_at);
    }

    public function test_admin_login_fails_with_invalid_credentials(): void
    {
        $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@admin.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('auth.failed'));
    }

    public function test_admin_login_validates_required_fields(): void
    {
        $response = $this->postJson('/api/admin/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_admin_can_fetch_profile_using_bearer_token(): void
    {
        [$admin, $token] = $this->loginAdmin();

        $response = $this->withToken($token)->getJson('/api/admin/me');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.id', $admin->id);
        $response->assertJsonPath('data.name', $admin->name);
        $response->assertJsonPath('data.email', $admin->email);
        $response->assertJsonPath('data.status', AdminStatusEnum::ACTIVE->value);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'name',
                'email',
                'status',
                'last_login_at',
            ],
        ]);
    }

    public function test_admin_can_refresh_token(): void
    {
        [$admin, $token] = $this->loginAdmin();

        $response = $this->withToken($token)->postJson('/api/admin/refresh');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('auth.refresh_success'));
        $response->assertJsonPath('data.token_type', 'Bearer');
        $response->assertJsonPath('data.expires_in', config('jwt.ttl') * 60);

        $refreshedToken = $response->json('data.access_token');
        $this->assertIsString($refreshedToken);
        $this->assertNotSame('', $refreshedToken);
        $this->assertNotSame($token, $refreshedToken);

        $admin->refresh();
        $this->assertNotNull($admin->last_login_at);
    }

    public function test_admin_can_logout_and_reuse_of_token_is_rejected(): void
    {
        [$admin, $token] = $this->loginAdmin();

        $logoutResponse = $this->withToken($token)->postJson('/api/admin/logout');

        $logoutResponse->assertOk();
        $logoutResponse->assertJsonPath('success', true);
        $logoutResponse->assertJsonPath('message', trans('auth.logout_success'));

        $meResponse = $this->withToken($token)->getJson('/api/admin/me');

        $meResponse->assertUnauthorized();
        $meResponse->assertJsonPath('success', false);
        $meResponse->assertJsonPath('message', trans('auth.unauthorized'));
    }

    public function test_protected_admin_routes_require_authentication(): void
    {
        $this->postJson('/api/admin/logout')->assertUnauthorized();
        $this->postJson('/api/admin/refresh')->assertUnauthorized();
        $this->getJson('/api/admin/me')->assertUnauthorized();
    }

    private function createAdmin(array $attributes = []): Admin
    {
        return Admin::query()->create(array_merge([
            'name' => 'Super Admin',
            'email' => 'admin@admin.com',
            'password_hash' => Hash::make('password123'),
            'status' => AdminStatusEnum::ACTIVE->value,
        ], $attributes));
    }

    private function loginAdmin(): array
    {
        $admin = $this->createAdmin();

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $response->assertOk();

        return [$admin->fresh(), $response->json('data.access_token')];
    }
}
