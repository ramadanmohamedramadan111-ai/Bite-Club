<?php

namespace App\Services\Domain\User\Order\Calculators;

class SubtotalCalculator implements OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void
    {
        $subtotal = $context->cart->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $context->subtotal = $subtotal;
        $context->total += $subtotal;
    }
}
