<?php

namespace Tests\Feature\Auth;

class AdminRefreshTest extends AdminAuthTest
{
    public function test_admin_can_refresh_token(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/refresh');

        // Assert
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
}
