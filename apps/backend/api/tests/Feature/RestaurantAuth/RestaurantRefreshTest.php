<?php

namespace Tests\Feature\RestaurantAuth;

class RestaurantRefreshTest extends RestaurantAuthTest
{
    public function test_restaurant_can_refresh_token(): void
    {
        // Arrange
        [, $token] = $this->loginRestaurant();

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/refresh');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_auth.refresh_success'));
        $response->assertJsonPath('data.token_type', 'Bearer');
        $response->assertJsonPath('data.expires_in', config('jwt.ttl') * 60);

        $refreshedToken = $response->json('data.access_token');
        $this->assertIsString($refreshedToken);
        $this->assertNotSame('', $refreshedToken);
        $this->assertNotSame($token, $refreshedToken);
    }
}
