<?php

namespace Tests\Feature\Restaurant;

use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ReviewsTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = Restaurant::factory()->create();
        $this->token = JWTAuth::fromUser($this->restaurant);
    }

    public function test_it_returns_all_reviews_with_unfiltered_summary()
    {
        $user1 = User::factory()->create(['first_name' => 'Alice', 'last_name' => 'Smith']);
        $user2 = User::factory()->create(['first_name' => 'Bob', 'last_name' => 'Jones']);
        $user3 = User::factory()->create(['first_name' => 'Charlie', 'last_name' => 'Brown']);

        // Create 3 reviews
        RestaurantReview::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user1->id,
            'rating' => 5,
            'comment' => 'Delicious pizza!',
        ]);

        RestaurantReview::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user2->id,
            'rating' => 4,
            'comment' => 'Good burgers.',
        ]);

        RestaurantReview::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user3->id,
            'rating' => 1,
            'comment' => 'Awful experience.',
        ]);

        // Review for another restaurant
        $otherRestaurant = Restaurant::factory()->create();
        RestaurantReview::factory()->create([
            'restaurant_id' => $otherRestaurant->id,
            'user_id' => $user1->id,
            'rating' => 5,
        ]);

        // Fetch without filters
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/reviews');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'average_rating',
                        'total_reviews',
                        'ratings' => [
                            '1', '2', '3', '4', '5'
                        ]
                    ],
                    'reviews' => [
                        'data' => [
                            '*' => [
                                'id',
                                'user' => [
                                    'id',
                                    'name',
                                    'profile_image',
                                ],
                                'rating',
                                'comment',
                                'created_at',
                            ]
                        ],
                        'meta'
                    ]
                ]
            ]);

        $this->assertEquals(3, $response->json('data.summary.total_reviews'));
        $this->assertEquals(3.3, round($response->json('data.summary.average_rating'), 1));
        $this->assertEquals(1, $response->json('data.summary.ratings.5'));
        $this->assertEquals(1, $response->json('data.summary.ratings.4'));
        $this->assertEquals(1, $response->json('data.summary.ratings.1'));
        $this->assertEquals(0, $response->json('data.summary.ratings.3'));

        // Count returned list (3 reviews total)
        $this->assertCount(3, $response->json('data.reviews.data'));

        // Test rating filter
        $responseFilterRating = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/reviews?rating=5');

        $responseFilterRating->assertStatus(200);
        $this->assertCount(1, $responseFilterRating->json('data.reviews.data'));
        $this->assertEquals(5, $responseFilterRating->json('data.reviews.data.0.rating'));
        // Summary must NOT change when filters are applied
        $this->assertEquals(3, $responseFilterRating->json('data.summary.total_reviews'));

        // Test search filter (by user name)
        $responseSearchUser = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/reviews?search=Alice');

        $responseSearchUser->assertStatus(200);
        $this->assertCount(1, $responseSearchUser->json('data.reviews.data'));
        $this->assertEquals('Alice Smith', $responseSearchUser->json('data.reviews.data.0.user.name'));
        // Summary must NOT change
        $this->assertEquals(3, $responseSearchUser->json('data.summary.total_reviews'));

        // Test search filter (by comment)
        $responseSearchComment = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/reviews?search=burgers');

        $responseSearchComment->assertStatus(200);
        $this->assertCount(1, $responseSearchComment->json('data.reviews.data'));
        $this->assertEquals('Good burgers.', $responseSearchComment->json('data.reviews.data.0.comment'));
        // Summary must NOT change
        $this->assertEquals(3, $responseSearchComment->json('data.summary.total_reviews'));
    }

    public function test_unauthenticated_restaurant_cannot_access_reviews()
    {
        $response = $this->getJson('/api/restaurant/reviews');
        $response->assertStatus(401);
    }
}
