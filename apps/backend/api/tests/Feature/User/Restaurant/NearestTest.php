<?php

namespace Tests\Feature\User\Restaurant;

use App\Models\User;
use App\Models\Restaurant;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class NearestTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_get_nearest_restaurants_sorted_by_distance(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        
        $baseLat = 30.0444; // Cairo
        $baseLng = 31.2357;

        // 1. Closest restaurant (Open & Active)
        $closest = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $closest->setting()->update([
            'is_open' => true,
            'latitude' => 30.0450, // Very close
            'longitude' => 31.2350,
        ]);

        // 2. Farthest restaurant (Open & Active)
        $farthest = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $farthest->setting()->update([
            'is_open' => true,
            'latitude' => 30.1500, // Far
            'longitude' => 31.3000,
        ]);

        // 3. Middle restaurant (Closed - should not appear)
        $closed = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $closed->setting()->update([
            'is_open' => false,
            'latitude' => 30.0500, // Medium distance
            'longitude' => 31.2400,
        ]);

        // 4. Middle restaurant (Suspended - should not appear)
        $suspended = Restaurant::factory()->create(['status' => RestaurantStatusEnum::SUSPENDED->value]);
        $suspended->setting()->update([
            'is_open' => true,
            'latitude' => 30.0500, 
            'longitude' => 31.2400,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/nearest?latitude={$baseLat}&longitude={$baseLng}");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant.nearest_success'));
        
        // Assert we got exactly 2 items back (closest and farthest)
        $this->assertCount(2, $response->json('data'));
        
        // Assert sorting is correct (closest first)
        $response->assertJsonPath('data.0.id', $closest->id);
        $response->assertJsonPath('data.1.id', $farthest->id);

        // Assert distance is calculated
        $this->assertArrayHasKey('distance', $response->json('data.0'));
        $this->assertLessThan($response->json('data.1.distance'), $response->json('data.0.distance'));

        // Assert settings are included
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'description',
                    'logo_url',
                    'cover_image_url',
                    'distance',
                    'settings' => [
                        'is_open',
                        'accept_orders',
                        'delivery_enabled',
                        'pickup_enabled',
                        'latitude',
                        'longitude'
                    ]
                ]
            ]
        ]);
    }
    
    public function test_nearest_restaurants_validates_input(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();

        // Act
        $response = $this->withToken($token)->getJson('/api/user/restaurants/nearest');

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['latitude', 'longitude']);
    }
}
