<?php

namespace Tests\Feature\RestaurantCategory;

use Tests\Feature\Auth\AdminAuthTest;

class RestaurantCategoryProtectionTest extends AdminAuthTest
{
    public function test_protected_restaurant_category_routes_require_authentication(): void
    {
        // Arrange
        $showEndpoint = '/api/admin/restaurant-categories/1';
        $storeEndpoint = '/api/admin/restaurant-categories';
        $updateEndpoint = '/api/admin/restaurant-categories/1';
        $destroyEndpoint = '/api/admin/restaurant-categories/1';

        // Act
        $showResponse = $this->getJson($showEndpoint);
        $storeResponse = $this->postJson($storeEndpoint);
        $updateResponse = $this->putJson($updateEndpoint);
        $destroyResponse = $this->deleteJson($destroyEndpoint);

        // Assert
        $showResponse->assertUnauthorized();
        $storeResponse->assertUnauthorized();
        $updateResponse->assertUnauthorized();
        $destroyResponse->assertUnauthorized();
    }
}
