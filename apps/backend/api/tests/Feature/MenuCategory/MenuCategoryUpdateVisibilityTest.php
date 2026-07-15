<?php

namespace Tests\Feature\MenuCategory;

use App\Models\MenuCategory;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class MenuCategoryUpdateVisibilityTest extends RestaurantAuthTest
{
    public function test_restaurant_can_update_menu_category_visibility(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'visibility' => MenuCategoryVisibilityEnum::VISIBLE->value
        ]);

        $payload = [
            'visibility' => MenuCategoryVisibilityEnum::HIDDEN->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-categories/{$category->id}/visibility", $payload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_category.update_visibility_success'));
        $response->assertJsonPath('data.visibility', MenuCategoryVisibilityEnum::HIDDEN->value);

        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
            'visibility' => MenuCategoryVisibilityEnum::HIDDEN->value,
        ]);
    }

    public function test_restaurant_cannot_update_visibility_with_invalid_value(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);

        $payload = [
            'visibility' => 'invalid_visibility_status',
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-categories/{$category->id}/visibility", $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['visibility']);
    }
}
