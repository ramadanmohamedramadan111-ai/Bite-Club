<?php

namespace Tests\Feature\Restaurant;

use App\Models\Restaurant;
use Tests\Feature\Auth\AdminAuthTest;

class RestaurantIndexTest extends AdminAuthTest
{
    public function test_admin_can_list_restaurants_paginated(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        Restaurant::factory()->count(20)->create();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurants');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.list_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'email', 'phone_number', 'status'] // Simplified expected fields based on common patterns
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]
        ]);
        $this->assertCount(15, $response->json('data.items'));
    }

    public function test_admin_can_list_all_restaurants_without_pagination(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        Restaurant::factory()->count(5)->create();

        // Act
        $response = $this->withToken($token)->getJson('/api/admin/restaurants?all=true');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.list_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'email', 'phone_number', 'status']
                ]
            ]
        ]);
        $response->assertJsonMissingPath('data.meta');
        // Because 5 created + maybe others (but DB is refreshed), it should be 5
        $this->assertCount(5, $response->json('data.items'));
    }
}
