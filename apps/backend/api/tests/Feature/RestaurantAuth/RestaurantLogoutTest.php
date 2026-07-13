<?php

namespace Tests\Feature\RestaurantAuth;

class RestaurantLogoutTest extends RestaurantAuthTest
{
    public function test_restaurant_can_logout_and_reuse_of_token_is_rejected(): void
    {
        // Arrange
        [, $token] = $this->loginRestaurant();

        // Act
        $logoutResponse = $this->withToken($token)->postJson('/api/restaurant/logout');
        $meResponse = $this->withToken($token)->getJson('/api/restaurant/me');

        // Assert
        $logoutResponse->assertOk();
        $logoutResponse->assertJsonPath('success', true);
        $logoutResponse->assertJsonPath('message', trans('restaurant_auth.logout_success'));

        $meResponse->assertUnauthorized();
        $meResponse->assertJsonPath('success', false);
        $meResponse->assertJsonPath('message', trans('restaurant_auth.unauthorized'));
    }
}
