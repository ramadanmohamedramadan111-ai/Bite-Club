<?php

namespace Database\Factories;

use App\Models\OrderPayment;
use App\Models\Order;
use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderPayment>
 */
class OrderPaymentFactory extends Factory
{
    protected $model = OrderPayment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'payment_type' => PaymentTypeEnum::FULL->value,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
            'amount' => 115.00,
            'status' => PaymentStatusEnum::PENDING->value,
        ];
    }
}
