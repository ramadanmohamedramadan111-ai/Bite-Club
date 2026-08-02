<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\RestaurantSetting;
use App\Models\Invoice;
use App\Models\PlatformDue;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Enums\Invoice\InvoiceStatusEnum;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

/**
 * Complete one-file seeder for the Restaurant Invoices dashboard.
 *
 * It guarantees a demo restaurant exists with real login credentials and
 * fills it (and every other existing restaurant) with a full set of invoices
 * covering all statuses (paid / unpaid / overdue) so the frontend can hit:
 *
 *   GET  /invoices            list (filter by status / paginate)
 *   GET  /invoices/{id}       details
 *   POST /invoices/{id}/pay   create payment session
 */
class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureDemoRestaurant();

        $restaurants = Restaurant::all();
        if ($restaurants->isEmpty()) {
            $restaurants = collect([$this->ensureDemoRestaurant()]);
        }

        // Deterministic reset: detach previous invoice linkage before wiping
        PlatformDue::whereNotNull('invoice_id')->update(['invoice_id' => null]);
        Invoice::query()->delete();

        $today = now()->startOfDay();

        foreach ($restaurants as $restaurant) {
            // --- Historical bills: paid + unpaid for the previous 3 months ---
            for ($m = 3; $m >= 1; $m--) {
                $billingStart = $today->copy()->subMonths($m)->startOfMonth();
                $billingEnd   = $billingStart->copy()->endOfMonth();
                $dueDate      = $billingEnd->copy()->addDays(14);

                // paid
                $paid = $this->makeInvoice($restaurant, $billingStart, $billingEnd, $dueDate, InvoiceStatusEnum::PAID);
                $paid->update(['paid_at' => $dueDate->copy()->subDays(random_int(1, 7))]);

                // unpaid (due in/near future)
                $this->makeInvoice($restaurant, $billingStart, $billingEnd, $dueDate->copy()->addMonth(), InvoiceStatusEnum::UNPAID);
            }

            // One overdue invoice for the current month (used by status filter)
            $overdueStart = $today->copy()->startOfMonth()->subDay();
            $overdueEnd   = $overdueStart->copy()->addDays(20);
            $this->makeInvoice($restaurant, $overdueStart, $overdueEnd, $today->copy()->subDays(random_int(1, 10)), InvoiceStatusEnum::OVERDUE);
        }
    }

    /**
     * Guarantee a login-ready demo restaurant (table entry + category + settings).
     */
    private function ensureDemoRestaurant(): Restaurant
    {
        $email    = 'lapiazza@biteclub.com';
        $password = 'password123';

        $category = RestaurantCategory::firstOrCreate(
            ['slug' => 'pizza-and-pasta'],
            [
                'name'      => 'Pizza & Pasta',
                'image_url' => 'storage/categories/default.jpeg',
            ]
        );

        $restaurant = Restaurant::firstOrCreate(
            ['email' => $email],
            [
                'name'          => 'La Piazza',
                'password_hash' => Hash::make($password),
                'phone_number'  => '01011111111',
                'address'       => '9 Road 9, Maadi, Cairo',
                'description'   => 'Authentic wood-fired Neapolitan pizzas and Italian pasta.',
                'category_id'   => $category->id,
                'status'        => 'active',
            ]
        );

        // Ensure the demo restaurant is active so it can log in
        if ($restaurant->status->value !== \App\Enums\Restaurant\RestaurantStatusEnum::ACTIVE->value) {
            $restaurant->update(['status' => \App\Enums\Restaurant\RestaurantStatusEnum::ACTIVE->value]);
        }

        // Ensure a working setting + opening pattern exists
        $restaurant->setting()->firstOrCreate([], [
            'is_open'             => true,
            'accept_orders'       => true,
            'delivery_enabled'    => true,
            'pickup_enabled'      => true,
            'latitude'            => 30.0444,
            'longitude'           => 31.2357,
            'delivery_radius'     => 10.00,
            'delivery_fee_per_km' => 5.00,
            'deposit_threshold'   => 250.00,
            'deposit_percentage'  => 50.00,
            'min_price_order'     => 25.00,
        ]);

        if ($restaurant->openingHours()->count() === 0) {
            for ($day = 0; $day <= 6; $day++) {
                $restaurant->openingHours()->create([
                    'day_of_week' => $day,
                    'opens_at'    => '10:00',
                    'closes_at'   => '22:00',
                    'is_closed'   => false,
                ]);
            }
        }

        // Small menu so /invoices and dashboards render nicely
        if (!MenuCategory::where('restaurant_id', $restaurant->id)->exists()) {
            $category = MenuCategory::create([
                'restaurant_id'     => $restaurant->id,
                'title'             => 'Wood-fired Pizzas',
                'icon_name'         => 'restaurant-menu',
                'short_description' => 'Fresh and tasty selections.',
                'visibility'        => MenuCategoryVisibilityEnum::VISIBLE->value,
            ]);
            MenuItem::create([
                'menu_category_id' => $category->id,
                'title'            => 'Margherita Pizza',
                'description'      => 'Classic pizza with fresh tomato sauce, mozzarella, and basil.',
                'image_url'        => 'storage/menu-items/default-item.jpeg',
                'price'            => 120.00,
                'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
            ]);
        }

        return $restaurant;
    }

    private function makeInvoice(
        Restaurant $restaurant,
        $billingStart,
        $billingEnd,
        $dueDate,
        InvoiceStatusEnum $status
    ): Invoice {
        $amount = round(random_int(400, 4200) + random_int(0, 99) / 100, 2);

        return Invoice::create([
            'restaurant_id'       => $restaurant->id,
            'amount'              => $amount,
            'billing_start_date'  => $billingStart->toDateString(),
            'billing_end_date'    => $billingEnd->toDateString(),
            'due_date'            => $dueDate->toDateString(),
            'status'              => $status->value,
            'payment_gateway_ref' => $status === InvoiceStatusEnum::PAID
                ? 'INV-' . strtoupper(Str::random(16))
                : null,
            'created_at'          => $billingStart,
            'updated_at'          => $billingStart,
        ]);
    }
}