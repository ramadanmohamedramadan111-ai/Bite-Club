<?php

namespace Tests\Feature\MenuItem;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class MenuItemIndexTest extends RestaurantAuthTest
{
    public function test_restaurant_can_list_menu_items(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        MenuItem::factory()->count(3)->create(['menu_category_id' => $category->id]);

        // Other restaurant's items
        $otherRestaurant = $this->createRestaurant();
        $otherCategory = MenuCategory::factory()->create(['restaurant_id' => $otherRestaurant->id]);
        MenuItem::factory()->create(['menu_category_id' => $otherCategory->id]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/menu-items');

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_item.list_success'));
        $this->assertCount(3, $response->json('data.items'));
    }

    public function test_restaurant_can_filter_menu_items_by_title_and_category(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'title' => 'Chicken Burger']);
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'title' => 'Beef Burger']);

        // Act
        $response = $this->withToken($token)->getJson("/api/restaurant/menu-items?title=Chicken&menu_category_id={$category->id}");

        // Assert
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.title', 'Chicken Burger');
    }

    public function test_restaurant_can_sort_menu_items(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'price' => 10.00]);
        MenuItem::factory()->create(['menu_category_id' => $category->id, 'price' => 20.00]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/menu-items?sort_by=price&sort_dir=desc');

        // Assert
        $response->assertStatus(200);
        $this->assertEquals(20.00, $response->json('data.items.0.price'));
        $this->assertEquals(10.00, $response->json('data.items.1.price'));
    }
}
