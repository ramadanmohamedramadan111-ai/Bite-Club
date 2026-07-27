<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\Restaurant;
use App\Models\User;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;
use Carbon\Carbon;

class AdminOrdersModuleTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = Admin::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@biteclub.com',
        ]);
        
        $token = JWTAuth::fromUser($this->admin);
        $this->headers = [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_admin_can_list_orders_with_stats_and_filters(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 7, 27, 12, 0, 0));

        $user1 = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
        $user2 = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

        $restaurant1 = Restaurant::factory()->create(['name' => 'Pizza Palace']);
        $restaurant2 = Restaurant::factory()->create(['name' => 'Burger Bar']);

        // Order 1: Today, John Doe, Pizza Palace, Status: completed
        $order1 = Order::factory()->create([
            'user_id'       => $user1->id,
            'restaurant_id' => $restaurant1->id,
            'status'        => OrderStatusEnum::COMPLETED->value,
            'created_at'    => Carbon::today()->addHours(2),
        ]);

        // Order 2: Yesterday, Jane Smith, Burger Bar, Status: pending
        $order2 = Order::factory()->create([
            'user_id'       => $user2->id,
            'restaurant_id' => $restaurant2->id,
            'status'        => OrderStatusEnum::PENDING->value,
            'created_at'    => Carbon::yesterday()->addHours(2),
        ]);

        // Order 3: 5 days ago, John Doe, Burger Bar, Status: preparing
        $order3 = Order::factory()->create([
            'user_id'       => $user1->id,
            'restaurant_id' => $restaurant2->id,
            'status'        => OrderStatusEnum::PREPARING->value,
            'created_at'    => Carbon::now()->subDays(5),
        ]);

        // Order 4: 10 days ago (outside this week), Jane Smith, Pizza Palace, Status: cancelled
        $order4 = Order::factory()->create([
            'user_id'       => $user2->id,
            'restaurant_id' => $restaurant1->id,
            'status'        => OrderStatusEnum::CANCELLED->value,
            'created_at'    => Carbon::now()->subDays(10),
        ]);

        // 1. Test period=today
        $response = $this->getJson('/api/admin/orders?period=today', $this->headers);
        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'filters' => ['period', 'from', 'to'],
                'statistics' => ['total_orders', 'pending_orders', 'processing_orders', 'completed_orders', 'cancelled_orders'],
                'orders' => ['data', 'links', 'meta'],
            ]
        ]);

        $this->assertEquals(1, $response->json('data.statistics.total_orders'));
        $this->assertEquals(1, $response->json('data.statistics.completed_orders'));
        $this->assertCount(1, $response->json('data.orders.data'));

        // 2. Test period=week (within 7 days: order1, order2, order3)
        // Wait, startOfWeek() of Carbon::create(2026, 7, 27) which is Monday.
        // Today is Monday. startOfWeek() is Monday.
        // If we filter with startOfWeek, only Order 1 is in this week.
        // Let's test with the custom ranges or period filters.
        // Let's test custom range
        $response = $this->getJson('/api/admin/orders?from=2026-07-20&to=2026-07-27', $this->headers);
        $response->assertOk();
        // Since all orders 1, 2, 3 are within 2026-07-20 to 2026-07-27
        $this->assertEquals(3, $response->json('data.statistics.total_orders'));

        // 3. Test that filters only affect the orders table data, not statistics
        // Filter by status=pending, period=week (let's use custom range instead to avoid day of week dependency)
        $response = $this->getJson('/api/admin/orders?from=2026-07-20&to=2026-07-27&status=pending', $this->headers);
        $response->assertOk();
        // Stats: returns all 3 orders within range
        $this->assertEquals(3, $response->json('data.statistics.total_orders'));
        $this->assertEquals(1, $response->json('data.statistics.pending_orders'));
        // Table data: only returns the pending order (order2)
        $this->assertCount(1, $response->json('data.orders.data'));
        $this->assertEquals($order2->id, $response->json('data.orders.data.0.id'));

        // 4. Test Search (e.g. restaurant name Pizza Palace)
        $response = $this->getJson('/api/admin/orders?from=2026-07-15&to=2026-07-27&search=Pizza Palace', $this->headers);
        $response->assertOk();
        // Stats not affected
        $this->assertEquals(4, $response->json('data.statistics.total_orders'));
        // Table filtered: Pizza Palace orders (order1, order4)
        $this->assertCount(2, $response->json('data.orders.data'));

        // 5. Test Search by Customer Name
        $response = $this->getJson('/api/admin/orders?from=2026-07-15&to=2026-07-27&search=Jane', $this->headers);
        $response->assertOk();
        // Table filtered: Jane's orders (order2, order4)
        $this->assertCount(2, $response->json('data.orders.data'));

        Carbon::setTestNow();
    }

    public function test_admin_can_retrieve_order_details(): void
    {
        $user = User::factory()->create([
            'first_name' => 'Dave',
            'last_name' => 'Miller',
        ]);
        $restaurant = Restaurant::factory()->create(['name' => 'Taco Town']);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'item_id' => \App\Models\MenuItem::factory()->create()->id,
            'item_name' => 'Crunchy Taco',
            'quantity' => 3,
            'price' => 2.50,
        ]);

        $payment = OrderPayment::create([
            'order_id' => $order->id,
            'payment_type' => \App\Enums\Payment\PaymentTypeEnum::ORDER_PAYMENT->value,
            'payment_method' => \App\Enums\Payment\PaymentMethodEnum::CASH->value,
            'amount' => 7.50,
            'status' => \App\Enums\Payment\PaymentStatusEnum::COMPLETED->value,
            'transaction_id' => 'TXN-123456',
        ]);

        $response = $this->getJson("/api/admin/orders/{$order->id}", $this->headers);
        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'status',
                'order_type',
                'subtotal',
                'delivery_fee',
                'service_fee',
                'total',
                'created_at',
                'updated_at',
                'user' => [
                    'id',
                    'username',
                    'first_name',
                    'last_name',
                    'email',
                    'phone_number',
                    'failed_pickup_count',
                    'status',
                    'last_login_at',
                    'created_at',
                ],
                'restaurant' => [
                    'id',
                    'name',
                    'email',
                    'phone_number',
                    'address',
                    'description',
                    'status',
                    'average_rating',
                ],
                'items' => [
                    '*' => [
                        'id',
                        'item_id',
                        'item_name',
                        'quantity',
                        'price',
                        'total_price',
                        'notes',
                    ]
                ],
                'payments' => [
                    '*' => [
                        'id',
                        'payment_type',
                        'payment_method',
                        'amount',
                        'status',
                        'transaction_id',
                        'created_at',
                    ]
                ]
            ]
        ]);

        $this->assertEquals($order->id, $response->json('data.id'));
        $this->assertEquals('Dave', $response->json('data.user.first_name'));
        $this->assertEquals('Taco Town', $response->json('data.restaurant.name'));
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('Crunchy Taco', $response->json('data.items.0.item_name'));
        $this->assertCount(1, $response->json('data.payments'));
        $this->assertEquals('TXN-123456', $response->json('data.payments.0.transaction_id'));
    }

    public function test_admin_retrieving_non_existent_order_returns_404(): void
    {
        $response = $this->getJson('/api/admin/orders/99999', $this->headers);
        $response->assertNotFound();
    }
}
