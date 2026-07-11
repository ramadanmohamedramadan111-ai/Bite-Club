<?php

namespace Tests\Feature\RestaurantCategory;

use App\Models\RestaurantCategory;
use Tests\Feature\Auth\AdminAuthTest;

class RestaurantCategoryShowTest extends AdminAuthTest
{
    public function test_admin_can_show_restaurant_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $category = RestaurantCategory::factory()->create();

        // Act
        $response = $this->withToken($token)->getJson("/api/admin/restaurant-categories/{$category->id}");

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.fetch_success'));
        $response->assertJsonPath('data.id', $category->id);
        $response->assertJsonPath('data.name', $category->name);
        $response->assertJsonPath('data.slug', $category->slug);
    }

    public function test_admin_receives_422_validation_error_if_category_does_not_exist(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurant-categories/999');

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonValidationErrors(['id']);
    }
}
