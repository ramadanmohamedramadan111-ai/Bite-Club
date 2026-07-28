<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Order;
use App\Models\Post;
use App\Models\GeneralSetting;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForAdmin(Admin $admin): array
    {
        $token = JWTAuth::fromUser($admin);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertStatus(401);
    }

    public function test_admin_can_retrieve_admin_dashboard_with_defaults(): void
    {
        $admin = Admin::factory()->create();

        // Seed settings
        GeneralSetting::updateOrCreate(
            [],
            [
                'commission_rate' => 10.00,
                'service_fee_amount' => 3.00,
            ]
        );

        $headers = $this->getHeadersForAdmin($admin);
        $response = $this->getJson('/api/admin/dashboard', $headers);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'stats' => [
                    'total_revenue',
                    'total_orders',
                    'new_users',
                    'pending_restaurants',
                ],
                'recent_orders',
                'recent_activity',
            ],
        ]);
    }

    public function test_admin_dashboard_stats_and_filtering(): void
    {
        $admin = Admin::factory()->create();

        // Seed settings (10% commission rate)
        GeneralSetting::updateOrCreate(
            [],
            [
                'commission_rate' => 10.00,
                'service_fee_amount' => 3.00,
            ]
        );

        // Seed Users
        $userToday = User::factory()->create(['created_at' => now()]);
        $userLastMonth = User::factory()->create(['created_at' => now()->subMonth()]);

        // Seed Restaurants
        $restaurantPending = Restaurant::factory()->create(['status' => RestaurantStatusEnum::PENDING_APPROVAL->value]);
        $restaurantActive = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);

        // Seed Orders
        // Completed Order today: subtotal = 100, service_fee = 3 -> commission = 10 -> revenue = 13
        $orderToday = Order::factory()->create([
            'user_id' => $userToday->id,
            'restaurant_id' => $restaurantActive->id,
            'subtotal' => 100.00,
            'service_fee' => 3.00,
            'total' => 103.00,
            'status' => OrderStatusEnum::COMPLETED->value,
            'created_at' => now(),
        ]);

        // Completed Order last month: subtotal = 200, service_fee = 3 -> commission = 20 -> revenue = 23
        $orderLastMonth = Order::factory()->create([
            'user_id' => $userToday->id,
            'restaurant_id' => $restaurantActive->id,
            'subtotal' => 200.00,
            'service_fee' => 3.00,
            'total' => 203.00,
            'status' => OrderStatusEnum::COMPLETED->value,
            'created_at' => now()->subMonth(),
        ]);

        $headers = $this->getHeadersForAdmin($admin);

        // Test Today filter
        $responseToday = $this->getJson('/api/admin/dashboard?period=today', $headers);
        $responseToday->assertOk();
        $this->assertEquals(1, $responseToday->json('data.stats.total_orders'));
        $this->assertEquals(13.00, $responseToday->json('data.stats.total_revenue'));
        $this->assertEquals(1, $responseToday->json('data.stats.new_users'));
        $this->assertEquals(1, $responseToday->json('data.stats.pending_restaurants')); // unaffected by filter

        // Test Month filter (should include today and anything in this month)
        $responseMonth = $this->getJson('/api/admin/dashboard?period=month', $headers);
        $responseMonth->assertOk();
        $this->assertEquals(1, $responseMonth->json('data.stats.total_orders')); // last month order is excluded
        
        // Test All filter
        $responseAll = $this->getJson('/api/admin/dashboard?period=all', $headers);
        $responseAll->assertOk();
        $this->assertEquals(2, $responseAll->json('data.stats.total_orders'));
        $this->assertEquals(36.00, $responseAll->json('data.stats.total_revenue')); // 13 + 23
        $this->assertEquals(2, $responseAll->json('data.stats.new_users'));
    }

    public function test_admin_dashboard_recent_orders_and_activity(): void
    {
        $admin = Admin::factory()->create();

        GeneralSetting::updateOrCreate(
            [],
            [
                'commission_rate' => 10.00,
                'service_fee_amount' => 3.00,
            ]
        );

        $user = User::factory()->create(['first_name' => 'Ahmed', 'last_name' => 'Ramadan']);
        $restaurant = Restaurant::factory()->create(['name' => 'Pizza Hut']);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'subtotal' => 420.00,
            'total' => 423.00,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now(),
        ]);

        $headers = $this->getHeadersForAdmin($admin);
        $response = $this->getJson('/api/admin/dashboard', $headers);

        $response->assertOk();
        
        // Verify recent orders structure
        $this->assertCount(1, $response->json('data.recent_orders'));
        $recentOrder = $response->json('data.recent_orders.0');
        $this->assertEquals($order->id, $recentOrder['id']);
        $this->assertEquals('Pizza Hut', $recentOrder['restaurant_name']);
        $this->assertEquals('Ahmed Ramadan', $recentOrder['host_user']);
        $this->assertEquals(423.00, $recentOrder['total_amount']);
        $this->assertEquals(42.00, $recentOrder['commission_amount']);
        $this->assertEquals('pending', $recentOrder['status']);

        // Verify recent activities are merged and returned
        $activities = $response->json('data.recent_activity');
        $this->assertNotEmpty($activities);
        
        // At least one of type user_registered or order_created should exist
        $types = collect($activities)->pluck('type')->toArray();
        $this->assertContains('user_registered', $types);
        $this->assertContains('order_created', $types);
    }
}
