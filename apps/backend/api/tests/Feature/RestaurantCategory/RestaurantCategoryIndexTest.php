<?php

namespace Tests\Feature\RestaurantCategory;

use App\Models\RestaurantCategory;
use Tests\Feature\Auth\AdminAuthTest;

class RestaurantCategoryIndexTest extends AdminAuthTest
{
    public function test_admin_can_list_restaurant_categories_paginated(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        RestaurantCategory::factory()->count(20)->create();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurant-categories');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.list_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'slug']
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]
        ]);
        $this->assertCount(15, $response->json('data.items'));
    }

    public function test_admin_can_list_all_restaurant_categories_without_pagination(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        RestaurantCategory::factory()->count(5)->create();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurant-categories?all=true');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.list_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'slug']
                ]
            ]
        ]);
        $response->assertJsonMissingPath('data.meta');
        $this->assertCount(5, $response->json('data.items'));
    }
}
