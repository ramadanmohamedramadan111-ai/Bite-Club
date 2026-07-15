<?php

namespace Tests\Feature\MenuCategory;

use App\Models\MenuCategory;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class MenuCategoryStoreTest extends RestaurantAuthTest
{
    public function test_restaurant_can_create_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $payload = [
            'title' => 'Main Courses',
            'icon_name' => 'icon-main',
            'short_description' => 'Delicious main courses',
            'visibility' => MenuCategoryVisibilityEnum::VISIBLE->value,
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/menu-categories', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_category.create_success'));
        $response->assertJsonPath('data.title', 'Main Courses');
        $response->assertJsonPath('data.icon_name', 'icon-main');

        $this->assertDatabaseHas('menu_categories', [
            'restaurant_id' => $restaurant->id,
            'title' => 'Main Courses',
        ]);
    }

    public function test_restaurant_cannot_create_duplicate_menu_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'title' => 'Drinks',
        ]);

        $payload = [
            'title' => 'Drinks',
            'icon_name' => 'icon-drink',
            'short_description' => 'Cold drinks',
            'visibility' => MenuCategoryVisibilityEnum::VISIBLE->value,
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/menu-categories', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonValidationErrors(['title']);
    }
}
