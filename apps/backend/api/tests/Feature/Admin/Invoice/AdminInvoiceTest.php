<?php

namespace Tests\Feature\Admin\Invoice;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

use App\Models\Admin;
use App\Models\Invoice;
use App\Models\Restaurant;
use App\Models\User;
use App\Enums\Invoice\InvoiceStatusEnum;

class AdminInvoiceTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;
    private Restaurant $restaurant;
    private Invoice $invoice;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Admin::factory()->create();
        
        $this->restaurant = Restaurant::factory()->create();

        $this->invoice = Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::UNPAID->value,
            'amount' => 500.00,
        ]);
    }

    public function test_admin_can_list_all_invoices(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/api/admin/invoices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id', 'amount', 'status', 'restaurant'
                        ]
                    ],
                    'meta'
                ]
            ]);
    }

    public function test_admin_can_filter_invoices_by_status(): void
    {
        // Create another invoice with PAID status
        Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::PAID->value,
        ]);

        $response = $this->actingAs($this->admin, 'admin')->getJson('/api/admin/invoices?status=paid');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.status', 'paid');
    }

    public function test_admin_can_view_invoice_details(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/api/admin/invoices/' . $this->invoice->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->invoice->id)
            ->assertJsonPath('data.restaurant.id', $this->restaurant->id);
    }

    public function test_admin_can_view_invoice_statistics(): void
    {
        // Add another invoice to check aggregation
        Invoice::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'status' => InvoiceStatusEnum::PAID->value,
            'amount' => 1000.00,
        ]);

        $response = $this->actingAs($this->admin, 'admin')->getJson('/api/admin/invoices/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_invoices_count',
                    'total_amount',
                    'paid_invoices_count',
                    'paid_amount',
                    'unpaid_invoices_count',
                    'unpaid_amount',
                    'overdue_invoices_count',
                    'overdue_amount',
                ]
            ]);

        $response->assertJsonPath('data.total_invoices_count', 2)
                 ->assertJsonPath('data.total_amount', 1500)
                 ->assertJsonPath('data.paid_invoices_count', 1)
                 ->assertJsonPath('data.paid_amount', 1000)
                 ->assertJsonPath('data.unpaid_invoices_count', 1)
                 ->assertJsonPath('data.unpaid_amount', 500);
    }
}
