<?php

namespace Tests\Feature\Restaurant;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Models\RestaurantSetting;
use App\Models\User;
use App\Enums\Order\OrderStatusEnum;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurant = Restaurant::factory()->create();
        // The RestaurantObserver automatically creates RestaurantSetting with is_open = true and accept_orders = true

        $this->token = JWTAuth::fromUser($this->restaurant);
    }

    public function test_it_returns_correct_dashboard_data_structure_and_period_filters()
    {
        $user = User::factory()->create();

        // Order completed today
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'total' => 100.00,
            'created_at' => now(),
        ]);

        // Order completed 3 days ago (this week, but not today)
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'total' => 50.00,
            'created_at' => now()->subDays(3),
        ]);

        // Order completed 10 days ago (this month, but not this week)
        // Wait, startOfWeek could be 3-6 days ago, so let's make sure it's 10 days ago
        // to be outside week but inside month.
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'total' => 200.00,
            'created_at' => now()->startOfMonth()->addHours(2), // guaranteed this month
        ]);

        // Pending order (should count in pending, not in revenue)
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::PENDING->value,
            'total' => 300.00,
        ]);

        // Review
        RestaurantReview::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'Great service!',
        ]);

        // Test Default Period (today)
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'revenue',
                        'orders',
                    ],
                    'pending_orders',
                    'average_rating',
                    'latest_orders',
                    'recent_reviews',
                    'restaurant_status' => [
                        'is_open',
                        'accepting_orders',
                    ]
                ]
            ]);

        $this->assertEquals(100.00, $response->json('data.summary.revenue'));
        $this->assertEquals(1, $response->json('data.summary.orders'));
        $this->assertEquals(1, $response->json('data.pending_orders'));
        $this->assertEquals(4.0, $response->json('data.average_rating'));
        $this->assertTrue($response->json('data.restaurant_status.is_open'));
        $this->assertTrue($response->json('data.restaurant_status.accepting_orders'));

        // Test week period
        $responseWeek = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/dashboard?period=week');

        $responseWeek->assertStatus(200);
        // Let's assert completed orders in the current week (today + 3 days ago)
        $this->assertEquals(150.00, $responseWeek->json('data.summary.revenue'));
        $this->assertEquals(2, $responseWeek->json('data.summary.orders'));
    }

    public function test_unauthenticated_restaurant_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/restaurant/dashboard');
        $response->assertStatus(401);
    }
}
