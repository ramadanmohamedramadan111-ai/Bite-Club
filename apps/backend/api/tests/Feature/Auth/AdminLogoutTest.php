<?php

namespace Tests\Feature\Auth;

class AdminLogoutTest extends AdminAuthTest
{
    public function test_admin_can_logout_and_reuse_of_token_is_rejected(): void
    {
        // Arrange
        [, $token] = $this->loginAdmin();

        // Act
        $logoutResponse = $this->withToken($token)->postJson('/api/admin/logout');
        $meResponse = $this->withToken($token)->getJson('/api/admin/me');

        // Assert
        $logoutResponse->assertOk();
        $logoutResponse->assertJsonPath('success', true);
        $logoutResponse->assertJsonPath('message', trans('auth.logout_success'));

        $meResponse->assertUnauthorized();
        $meResponse->assertJsonPath('success', false);
        $meResponse->assertJsonPath('message', trans('auth.unauthorized'));
    }
}
