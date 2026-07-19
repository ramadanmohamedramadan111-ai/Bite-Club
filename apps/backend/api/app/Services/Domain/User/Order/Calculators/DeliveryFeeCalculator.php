<?php

namespace App\Services\Domain\User\Order\Calculators;

use App\Helpers\DistanceHelper;
use App\Enums\Order\OrderTypeEnum;
use Exception;

class DeliveryFeeCalculator implements OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void
    {
        if ($context->orderType !== OrderTypeEnum::DELIVERY->value) {
            return;
        }

        $lat = $context->lat;
        $long = $context->long;
        $restaurantSetting = $context->restaurantSetting;

        if ($lat !== null && $long !== null && $restaurantSetting->latitude !== null && $restaurantSetting->longitude !== null) {
            $distance = DistanceHelper::calculate($lat, $long, $restaurantSetting->latitude, $restaurantSetting->longitude);
            
            if ($distance > $restaurantSetting->delivery_radius) {
                throw new Exception(trans('order.out_of_delivery_zone'));
            }
            
            $deliveryFee = $distance * $restaurantSetting->delivery_fee_per_km;
            $context->deliveryFee = $deliveryFee;
            $context->total += $deliveryFee;
        }
    }
}
