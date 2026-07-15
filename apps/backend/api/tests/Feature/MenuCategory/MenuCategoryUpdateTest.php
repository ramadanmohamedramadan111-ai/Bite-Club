<?php

namespace Tests\Feature\MenuCategory;

use App\Models\MenuCategory;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class MenuCategoryUpdateTest extends RestaurantAuthTest
{
    public function test_restaurant_can_update_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);

        $payload = [
            'title' => 'Updated Title',
            'icon_name' => 'icon-updated',
            'short_description' => 'Updated desc',
            'visibility' => MenuCategoryVisibilityEnum::HIDDEN->value,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-categories/{$category->id}", $payload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_category.update_success'));
        $response->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_restaurant_cannot_update_menu_category_with_duplicate_title(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'title' => 'Desserts',
        ]);
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'title' => 'Drinks',
        ]);

        $payload = [
            'title' => 'Desserts', // Already exists for this restaurant
            'icon_name' => 'icon-updated',
            'short_description' => 'Updated desc',
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-categories/{$category->id}", $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_restaurant_cannot_update_other_restaurants_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        
        $otherRestaurant = $this->createRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $otherRestaurant->id]);

        $payload = [
            'title' => 'Updated Title',
            'icon_name' => 'icon-updated',
            'short_description' => 'Updated desc',
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/restaurant/menu-categories/{$category->id}", $payload);

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('menu_category.not_found'));
    }
}
