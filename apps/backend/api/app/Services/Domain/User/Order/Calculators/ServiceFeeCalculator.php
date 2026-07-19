<?php

namespace App\Services\Domain\User\Order\Calculators;

class ServiceFeeCalculator implements OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void
    {
        if ($context->generalSetting) {
            $serviceFee = $context->generalSetting->service_fee_amount;
            $context->serviceFee = $serviceFee;
            $context->total += $serviceFee;
        }
    }
}
