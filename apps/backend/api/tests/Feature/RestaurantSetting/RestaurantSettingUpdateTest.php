<?php

namespace Tests\Feature\RestaurantSetting;

use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class RestaurantSettingUpdateTest extends RestaurantAuthTest
{
    public function test_restaurant_can_update_its_settings(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        
        $updateData = [
            'is_open'             => false,
            'accept_orders'       => false,
            'delivery_enabled'    => true,
            'pickup_enabled'      => false,
            'latitude'            => 30.12345678,
            'longitude'           => 31.87654321,
            'delivery_radius'     => 15.5,
            'delivery_fee_per_km' => 12.00,
            'deposit_threshold'   => 300.00,
            'deposit_percentage'  => 40.00,
            'min_price_order'     => 50.00,
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/restaurant/settings', $updateData);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_setting.update_success'));
        
        // Assert data is updated correctly
        $response->assertJsonPath('data.is_open', false);
        $response->assertJsonPath('data.accept_orders', false);
        $response->assertJsonPath('data.pickup_enabled', false);
        $response->assertJsonPath('data.delivery_enabled', true);
        
        // Floats and decimals might be returned as strings depending on DB driver, so we use string assertions for decimals or skip exact type matching
        $this->assertEquals(30.12345678, $response->json('data.latitude'));
        $this->assertEquals(31.87654321, $response->json('data.longitude'));
        $this->assertEquals(15.5, $response->json('data.delivery_radius'));
        $this->assertEquals(40.00, $response->json('data.deposit_percentage'));
        $this->assertEquals(50.00, $response->json('data.min_price_order'));
        
        // Verify in DB
        $this->assertDatabaseHas('restaurant_settings', [
            'restaurant_id' => $restaurant->id,
            'is_open' => false,
            'delivery_radius' => 15.50,
            'min_price_order' => 50.00,
        ]);
    }
    
    public function test_restaurant_can_partially_update_its_settings(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        
        $updateData = [
            'is_open' => false,
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/restaurant/settings', $updateData);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('data.is_open', false);
        
        // Delivery radius should remain the default 10.00
        $this->assertEquals(10.00, $response->json('data.delivery_radius'));
    }
}
