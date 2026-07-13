<?php

namespace Tests\Feature\RestaurantAuth;

class RestaurantAuthProtectionTest extends RestaurantAuthTest
{
    public function test_protected_restaurant_routes_require_authentication(): void
    {
        // Arrange
        $logoutEndpoint = '/api/restaurant/logout';
        $refreshEndpoint = '/api/restaurant/refresh';
        $meEndpoint = '/api/restaurant/me';

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
