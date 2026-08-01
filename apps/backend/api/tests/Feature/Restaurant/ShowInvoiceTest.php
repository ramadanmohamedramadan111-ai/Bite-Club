<?php

namespace Tests\Feature\Restaurant;

use App\Models\Invoice;
use App\Models\PlatformDue;
use App\Models\Order;
use App\Models\Restaurant;
use App\Enums\Invoice\InvoiceStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ShowInvoiceTest extends TestCase
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

    public function test_it_returns_invoice_details_with_platform_dues()
    {
        $invoice = Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        $order = Order::factory()->create(['restaurant_id' => $this->restaurant->id]);
        
        PlatformDue::create([
            'invoice_id' => $invoice->id,
            'order_id' => $order->id,
            'restaurant_id' => $this->restaurant->id,
            'commission_rate' => 15.00,
            'commission_amount' => 10.50,
            'service_fee' => 0.00,
            'total_due' => 10.50,
            'invoice_status' => \App\Enums\Invoice\PlatformDueStatusEnum::INVOICED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/invoices/{$invoice->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'id',
                         'amount',
                         'billing_start_date',
                         'billing_end_date',
                         'due_date',
                         'status',
                         'platform_dues' => [
                             '*' => [
                                 'id', 
                                 'order_id', 
                                 'commission_rate',
                                 'commission_amount',
                                 'service_fee',
                                 'total_due',
                                 'invoice_status',
                                 'order' => ['total_price', 'status', 'created_at']
                             ]
                         ]
                     ]
                 ]);
    }

    public function test_it_returns_404_if_invoice_does_not_belong_to_restaurant()
    {
        $invoice = Invoice::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/invoices/{$invoice->id}");

        $response->assertStatus(404);
    }

    public function test_it_returns_unauthorized_if_no_token_provided()
    {
        $invoice = Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        $response = $this->getJson("/api/restaurant/invoices/{$invoice->id}");

        $response->assertStatus(401);
    }
}
