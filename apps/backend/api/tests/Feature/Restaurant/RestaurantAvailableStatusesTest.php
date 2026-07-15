<?php

namespace Tests\Feature\Restaurant;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use Tests\Feature\Auth\AdminAuthTest;

class RestaurantAvailableStatusesTest extends AdminAuthTest
{
    public function test_admin_can_get_available_statuses_for_pending_restaurant(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $restaurant = Restaurant::factory()->create([
            'status' => RestaurantStatusEnum::PENDING_APPROVAL->value,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/admin/restaurants/{$restaurant->id}/available-statuses");

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.available_transitions_success'));
        $response->assertJsonPath('data.statuses', [
            RestaurantStatusEnum::ACTIVE->value,
            RestaurantStatusEnum::REJECTED->value,
        ]);
    }

    public function test_admin_can_get_available_statuses_for_active_restaurant(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $restaurant = Restaurant::factory()->create([
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/admin/restaurants/{$restaurant->id}/available-statuses");

        // Assert
        $response->assertOk();
        $response->assertJsonPath('data.statuses', [
            RestaurantStatusEnum::SUSPENDED->value,
            RestaurantStatusEnum::CLOSED->value,
        ]);
    }

    public function test_fails_if_restaurant_not_found(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurants/999/available-statuses');

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('errors.id.0', trans('restaurant.not_found'));
    }
}
