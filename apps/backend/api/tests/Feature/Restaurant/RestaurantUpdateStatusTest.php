<?php

namespace Tests\Feature\Restaurant;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use Tests\Feature\Auth\AdminAuthTest;

class RestaurantUpdateStatusTest extends AdminAuthTest
{
    public function test_admin_can_update_restaurant_status(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $restaurant = Restaurant::factory()->create([
            'status' => RestaurantStatusEnum::PENDING_APPROVAL->value,
        ]);

        $payload = [
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/admin/restaurants/{$restaurant->id}/status", $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.status_update_success'));
        
        $this->assertDatabaseHas('restaurants', [
            'id' => $restaurant->id,
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);
    }

    public function test_admin_receives_unchanged_message_if_status_is_the_same(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $restaurant = Restaurant::factory()->create([
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);

        $payload = [
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/admin/restaurants/{$restaurant->id}/status", $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.status_already_set'));
    }

    public function test_fails_if_restaurant_not_found(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        
        $payload = [
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/admin/restaurants/999/status', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('errors.id.0', trans('restaurant.not_found'));
    }
}
