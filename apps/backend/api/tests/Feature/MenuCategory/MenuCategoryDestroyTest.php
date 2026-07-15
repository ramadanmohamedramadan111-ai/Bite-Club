<?php

namespace Tests\Feature\MenuCategory;

use App\Models\MenuCategory;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class MenuCategoryDestroyTest extends RestaurantAuthTest
{
    public function test_restaurant_can_delete_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/restaurant/menu-categories/{$category->id}");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_category.delete_success'));

        $this->assertDatabaseMissing('menu_categories', [
            'id' => $category->id,
        ]);
    }

    public function test_restaurant_cannot_delete_other_restaurants_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        
        $otherRestaurant = $this->createRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $otherRestaurant->id]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/restaurant/menu-categories/{$category->id}");

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('menu_category.not_found'));

        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
        ]);
    }
}
