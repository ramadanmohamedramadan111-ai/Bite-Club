<?php

namespace App\Services\Domain\User\Order\Calculators;

class CommissionCalculator implements OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void
    {
        if ($context->generalSetting) {
            $commissionRate = $context->generalSetting->commission_rate;
            $context->systemCommission = ($context->subtotal * $commissionRate) / 100;
        }
    }
}
