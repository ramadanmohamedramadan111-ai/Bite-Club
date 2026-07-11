<?php

namespace Tests\Feature\Auth;

class AdminAuthProtectionTest extends AdminAuthTest
{
    public function test_protected_admin_routes_require_authentication(): void
    {
        // Arrange
        $logoutEndpoint = '/api/admin/logout';
        $refreshEndpoint = '/api/admin/refresh';
        $meEndpoint = '/api/admin/me';

        // Act
        $logoutResponse = $this->postJson($logoutEndpoint);
        $refreshResponse = $this->postJson($refreshEndpoint);
        $meResponse = $this->getJson($meEndpoint);

        // Assert
        $logoutResponse->assertUnauthorized();
        $refreshResponse->assertUnauthorized();
        $meResponse->assertUnauthorized();
    }
}
