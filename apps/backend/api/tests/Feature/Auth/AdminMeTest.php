<?php

namespace Tests\Feature\Auth;

use App\Enums\Auth\AdminStatusEnum;

class AdminMeTest extends AdminAuthTest
{
    public function test_admin_can_fetch_profile_using_bearer_token(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/me');

        // Assert
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
}
