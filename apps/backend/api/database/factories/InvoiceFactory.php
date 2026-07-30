<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'restaurant_id' => \App\Models\Restaurant::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'billing_start_date' => $this->faker->date(),
            'billing_end_date' => $this->faker->date(),
            'due_date' => $this->faker->date(),
            'status' => \App\Enums\Invoice\InvoiceStatusEnum::UNPAID->value,
            'payment_gateway_ref' => null,
        ];
    }
}
