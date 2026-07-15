<?php

namespace Tests\Feature\MenuCategory;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class MenuCategoryIndexTest extends RestaurantAuthTest
{
    public function test_restaurant_can_list_menu_categories(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        MenuCategory::factory()->count(3)->create(['restaurant_id' => $restaurant->id]);
        
        // Create another restaurant's category to ensure it's not listed
        $otherRestaurant = $this->createRestaurant();
        MenuCategory::factory()->create(['restaurant_id' => $otherRestaurant->id]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/menu-categories');

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_category.list_success'));
        $this->assertCount(3, $response->json('data.items'));
    }

    public function test_restaurant_can_filter_menu_categories_by_title(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        MenuCategory::factory()->create(['restaurant_id' => $restaurant->id, 'title' => 'Burgers']);
        MenuCategory::factory()->create(['restaurant_id' => $restaurant->id, 'title' => 'Pizzas']);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/menu-categories?title=Burger');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.title', 'Burgers');
    }

    public function test_restaurant_can_get_all_menu_categories_without_pagination(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        MenuCategory::factory()->count(20)->create(['restaurant_id' => $restaurant->id]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/menu-categories?all=1');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(20, $response->json('data.items'));
        $response->assertJsonMissing(['data' => ['meta' => []]]); // No meta means no pagination
    }
}
