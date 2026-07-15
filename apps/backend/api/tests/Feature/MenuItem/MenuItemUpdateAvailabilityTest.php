<?php

namespace Tests\Feature\MenuItem;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class MenuItemUpdateAvailabilityTest extends RestaurantAuthTest
{
    public function test_restaurant_can_update_menu_item_availability(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability' => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        $payload = [
            'availability' => MenuItemAvailabilityEnum::UNAVAILABLE->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-items/{$item->id}/availability", $payload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_item.update_availability_success'));
        $response->assertJsonPath('data.availability', MenuItemAvailabilityEnum::UNAVAILABLE->value);

        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'availability' => MenuItemAvailabilityEnum::UNAVAILABLE->value,
        ]);
    }
}
