<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class MeTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_get_their_own_review(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $review = RestaurantReview::factory()->create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
            'rating'        => 4,
            'comment'       => 'Good',
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/reviews/me");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_review.fetched'));
        $response->assertJsonPath('data.id', $review->id);
        $response->assertJsonPath('data.rating', 4);
        $response->assertJsonPath('data.comment', 'Good');
    }

    public function test_me_endpoint_returns_404_if_no_review(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/reviews/me");

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('restaurant_review.not_found'));
    }
}
