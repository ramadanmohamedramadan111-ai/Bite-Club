<?php

namespace Tests\Feature\Restaurant;

use App\Models\Invoice;
use App\Models\Restaurant;
use App\Enums\Invoice\InvoiceStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ListInvoicesTest extends TestCase
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

    public function test_it_returns_paginated_invoices_for_the_restaurant()
    {
        Invoice::factory()->count(20)->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        // Invoices for another restaurant
        Invoice::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/invoices?per_page=10');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'items' => [
                             '*' => ['id', 'amount', 'billing_start_date', 'billing_end_date', 'due_date', 'status', 'created_at']
                         ],
                         'meta' => ['current_page', 'last_page', 'per_page', 'total']
                     ]
                 ]);

        $data = $response->json('data');

        // Verify pagination and scoping
        $this->assertCount(10, $data['items']);
        $this->assertEquals(20, $data['meta']['total']);
        $this->assertEquals(10, $data['meta']['per_page']);
    }

    public function test_it_can_filter_invoices_by_status()
    {
        Invoice::factory()->count(3)->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::UNPAID->value,
        ]);

        Invoice::factory()->count(2)->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::PAID->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/invoices?status=' . InvoiceStatusEnum::PAID->value);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $data = $response->json('data');

        $this->assertCount(2, $data['items']);
        $this->assertEquals(2, $data['meta']['total']);
        foreach ($data['items'] as $item) {
            $this->assertEquals(InvoiceStatusEnum::PAID->value, $item['status']);
        }
    }

    public function test_it_returns_unauthorized_if_no_token_provided()
    {
        $response = $this->getJson('/api/restaurant/invoices');

        $response->assertStatus(401);
    }
}
