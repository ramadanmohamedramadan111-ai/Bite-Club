<?php

namespace App\Services\Domain\User\Order\Calculators;

use App\Models\Cart;
use App\Models\RestaurantSetting;
use App\Models\GeneralSetting;

class OrderCalculationContext
{
    public float $subtotal = 0.0;
    public float $deliveryFee = 0.0;
    public float $serviceFee = 0.0;
    public float $total = 0.0;

    public bool $requiresDeposit = false;
    public float $depositPercentage = 0.0;
    public float $depositAmount = 0.0;
    public float $remainingAmount = 0.0;

    public float $systemCommission = 0.0;

    public function __construct(
        public readonly Cart $cart,
        public readonly RestaurantSetting $restaurantSetting,
        public readonly GeneralSetting $generalSetting,
        public readonly string $orderType,
        public readonly ?float $lat = null,
        public readonly ?float $long = null
    ) {}
}
