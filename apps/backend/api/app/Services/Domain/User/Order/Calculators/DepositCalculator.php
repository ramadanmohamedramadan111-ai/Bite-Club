<?php

namespace App\Services\Domain\User\Order\Calculators;

class DepositCalculator implements OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void
    {
        $restaurantSetting = $context->restaurantSetting;

        $context->remainingAmount = $context->total;

        if ($restaurantSetting->deposit_threshold > 0 && $context->total >= $restaurantSetting->deposit_threshold) {
            $context->requiresDeposit = true;
            $context->depositPercentage = $restaurantSetting->deposit_percentage;
            $context->depositAmount = ($context->total * $context->depositPercentage) / 100;
            $context->remainingAmount = $context->total - $context->depositAmount;
        }
    }
}
