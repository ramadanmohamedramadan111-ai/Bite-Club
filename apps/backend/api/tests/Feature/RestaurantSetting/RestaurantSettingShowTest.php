<?php

namespace Tests\Feature\RestaurantSetting;

use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class RestaurantSettingShowTest extends RestaurantAuthTest
{
    public function test_restaurant_can_fetch_its_settings(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/settings');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_setting.fetch_success'));
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'restaurant_id',
                'is_open',
                'accept_orders',
                'delivery_enabled',
                'pickup_enabled',
                'latitude',
                'longitude',
                'delivery_radius',
                'delivery_fee_per_km',
                'deposit_threshold',
                'deposit_percentage',
                'min_price_order',
                'updated_at'
            ]
        ]);
        
        // Assert it fetched the correct default values created by the observer
        $response->assertJsonPath('data.restaurant_id', $restaurant->id);
        $response->assertJsonPath('data.is_open', true);
        $response->assertJsonPath('data.deposit_percentage', "50.00");
        $response->assertJsonPath('data.min_price_order', "25.00");
    }
}
