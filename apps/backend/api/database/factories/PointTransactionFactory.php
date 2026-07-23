<?php

namespace Database\Factories;

use App\Models\PointTransaction;
use App\Models\Wallet;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class PointTransactionFactory extends Factory
{
    protected $model = PointTransaction::class;

    public function definition(): array
    {
        $type = fake()->randomElement(PointTransactionTypeEnum::cases());
        $source = fake()->randomElement(PointTransactionSourceEnum::cases());
        $points = fake()->numberBetween(10, 500);

        return [
            'wallet_id'      => Wallet::factory(),
            'points'         => $type === PointTransactionTypeEnum::EARN ? $points : -$points,
            'type'           => $type->value,
            'source'         => $source->value,
            'reference_id'   => null,
            'reference_type' => null,
        ];
    }
}
