<?php

namespace Tests\Feature\Restaurant;

use App\Models\Invoice;
use App\Models\Restaurant;
use App\Enums\Invoice\InvoiceStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class PayInvoiceTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->restaurant = Restaurant::factory()->create();
        $this->token = JWTAuth::fromUser($this->restaurant);
        
        // Mock the platform configs
        config(['payment.kashier.base_url' => 'https://test.kashier.io']);
        config(['payment.kashier.api_key' => 'test_api_key']);
        config(['payment.kashier.merchant_id' => 'test_merchant_id']);
        config(['payment.kashier.webhook_secret' => 'test_webhook_secret']);
    }

    public function test_it_creates_payment_session_successfully()
    {
        $invoice = Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::UNPAID->value,
        ]);

        Http::fake([
            'https://test.kashier.io/v3/payment/sessions' => Http::response([
                'sessionUrl' => 'https://test.kashier.io/checkout/12345',
            ], 200),
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/restaurant/invoices/{$invoice->id}/pay");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonPath('data.checkout_url', 'https://test.kashier.io/checkout/12345');
    }

    public function test_it_returns_error_if_already_paid()
    {
        $invoice = Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::PAID->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/restaurant/invoices/{$invoice->id}/pay");

        $response->assertStatus(400)
                 ->assertJsonPath('success', false);
    }

    public function test_it_returns_404_if_not_found_or_not_owned()
    {
        $invoice = Invoice::factory()->create(); // Belongs to another restaurant

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/restaurant/invoices/{$invoice->id}/pay");

        $response->assertStatus(404);
    }
}
