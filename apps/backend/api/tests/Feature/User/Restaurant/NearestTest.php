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

    public function test_user_can_get_nearest_restaurants_sorted_by_rating_and_distance(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        
        $baseLat = 30.0444; // Cairo
        $baseLng = 31.2357;

        // 1. Closest restaurant but lower rating
        $closest = Restaurant::factory()->create([
            'status'         => RestaurantStatusEnum::ACTIVE->value,
            'average_rating' => 4.0,
            'reviews_count'  => 10,
        ]);
        $closest->setting()->update([
            'is_open'   => true,
            'latitude'  => 30.0450, // Very close
            'longitude' => 31.2350,
        ]);

        // 2. Farthest restaurant but higher rating (Should appear FIRST)
        $farthest = Restaurant::factory()->create([
            'status'         => RestaurantStatusEnum::ACTIVE->value,
            'average_rating' => 5.0,
            'reviews_count'  => 20,
        ]);
        $farthest->setting()->update([
            'is_open'   => true,
            'latitude'  => 30.1500, // Far
            'longitude' => 31.3000,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/nearest?latitude={$baseLat}&longitude={$baseLng}");

        // Assert
        $response->assertStatus(200);
        
        // Assert we got exactly 2 items back
        $this->assertCount(2, $response->json('data'));
        
        // Assert sorting is correct (highest rated first, then closest)
        $response->assertJsonPath('data.0.id', $farthest->id);
        $response->assertJsonPath('data.1.id', $closest->id);

        // Assert new fields are included
        $this->assertArrayHasKey('average_rating', $response->json('data.0'));
        $this->assertArrayHasKey('reviews_count', $response->json('data.0'));
    }

    public function test_user_can_get_highest_rated_restaurants_without_location(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();

        $rating4 = Restaurant::factory()->create([
            'status'         => RestaurantStatusEnum::ACTIVE->value,
            'average_rating' => 4.0,
            'reviews_count'  => 10,
        ]);
        $rating4->setting()->update(['is_open' => true]);

        $rating5 = Restaurant::factory()->create([
            'status'         => RestaurantStatusEnum::ACTIVE->value,
            'average_rating' => 5.0,
            'reviews_count'  => 50,
        ]);
        $rating5->setting()->update(['is_open' => true]);

        // Act (no latitude/longitude)
        $response = $this->withToken($token)->getJson('/api/user/restaurants/nearest?limit=2');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
        
        // Should be ordered by rating
        $response->assertJsonPath('data.0.id', $rating5->id);
        $response->assertJsonPath('data.1.id', $rating4->id);

        // Distance should be null
        $this->assertNull($response->json('data.0.distance'));
    }
    
    public function test_nearest_restaurants_validates_input(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();

        // Act
        $response = $this->withToken($token)->getJson('/api/user/restaurants/nearest?latitude=900&longitude=invalid&limit=1000');

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['latitude', 'longitude', 'limit']);
    }
}
