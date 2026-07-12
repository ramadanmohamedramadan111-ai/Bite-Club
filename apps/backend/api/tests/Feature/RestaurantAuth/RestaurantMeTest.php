<?php

namespace Tests\Feature\RestaurantAuth;

use App\Enums\Restaurant\RestaurantStatusEnum;

class RestaurantMeTest extends RestaurantAuthTest
{
    public function test_restaurant_can_fetch_profile_using_bearer_token(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant([
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/me');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.id', $restaurant->id);
        $response->assertJsonPath('data.name', $restaurant->name);
        $response->assertJsonPath('data.email', $restaurant->email);
        $response->assertJsonPath('data.phone_number', $restaurant->phone_number);
        $response->assertJsonPath('data.address', $restaurant->address);
        $response->assertJsonPath('data.status', RestaurantStatusEnum::ACTIVE->value);
        $response->assertJsonStructure([
            'success',
            'data' => [
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
        ]);
    }
}
