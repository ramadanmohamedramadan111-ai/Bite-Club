<?php

namespace Tests\Feature\RestaurantAuth;

use App\Enums\Restaurant\RestaurantStatusEnum;

class RestaurantRegisterTest extends RestaurantAuthTest
{
    public function test_restaurant_can_register_and_get_pending_account(): void
    {
        // Arrange
        $payload = [
            'name' => 'Pizza Palace',
            'email' => 'pizza@restaurant.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone_number' => '01123456789',
            'address' => 'Cairo, Egypt',
            'description' => 'Italian restaurant',
        ];

        // Act
        $response = $this->postJson('/api/restaurant/register', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_auth.register_success'));
        $response->assertJsonPath('data.name', 'Pizza Palace');
        $response->assertJsonPath('data.email', 'pizza@restaurant.com');
        $response->assertJsonPath('data.phone_number', '01123456789');
        $response->assertJsonPath('data.address', 'Cairo, Egypt');
        $response->assertJsonPath('data.status', RestaurantStatusEnum::PENDING_APPROVAL->value);

        $this->assertDatabaseHas('restaurants', [
            'email' => 'pizza@restaurant.com',
            'phone_number' => '01123456789',
            'status' => RestaurantStatusEnum::PENDING_APPROVAL->value,
        ]);
    }

    public function test_restaurant_register_validates_required_fields(): void
    {
        // Arrange
        $payload = [];

        // Act
        $response = $this->postJson('/api/restaurant/register', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonValidationErrors([
            'name',
            'email',
            'password',
            'phone_number',
            'address',
        ]);
    }
}
