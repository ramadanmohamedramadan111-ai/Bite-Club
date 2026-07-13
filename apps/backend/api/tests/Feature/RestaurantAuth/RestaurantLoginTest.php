<?php

namespace Tests\Feature\RestaurantAuth;

use App\Enums\Restaurant\RestaurantStatusEnum;

class RestaurantLoginTest extends RestaurantAuthTest
{
    public function test_restaurant_can_login_and_receive_token_payload(): void
    {
        // Arrange
        $restaurant = $this->createRestaurant([
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);

        // Act
        $response = $this->postJson('/api/restaurant/login', [
            'email' => $restaurant->email,
            'password' => 'password123',
        ]);

        // Assert
        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'access_token',
                'token_type',
                'expires_in',
                'restaurant' => [
                    'id',
                    'name',
                    'email',
                    'phone_number',
                    'address',
                    'status',
                    'category_id',
                    'description',
                    'logo_url',
                ],
            ],
        ]);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_auth.login_success'));
        $response->assertJsonPath('data.token_type', 'Bearer');
        $response->assertJsonPath('data.expires_in', config('jwt.ttl') * 60);
        $response->assertJsonPath('data.restaurant.id', $restaurant->id);
        $response->assertJsonPath('data.restaurant.email', $restaurant->email);
        $response->assertJsonPath('data.restaurant.status', RestaurantStatusEnum::ACTIVE->value);

        $accessToken = $response->json('data.access_token');
        $this->assertIsString($accessToken);
        $this->assertNotSame('', $accessToken);
    }

    public function test_restaurant_login_fails_with_invalid_credentials(): void
    {
        // Arrange
        $this->createRestaurant([
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);

        // Act
        $response = $this->postJson('/api/restaurant/login', [
            'email' => 'restaurant@example.com',
            'password' => 'wrong-password',
        ]);

        // Assert
        $response->assertUnauthorized();
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('restaurant_auth.failed'));
    }

    public function test_restaurant_login_validates_required_fields(): void
    {
        // Arrange
        $payload = [];

        // Act
        $response = $this->postJson('/api/restaurant/login', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonValidationErrors(['email', 'password']);
    }
}
