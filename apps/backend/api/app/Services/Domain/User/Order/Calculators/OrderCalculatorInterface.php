<?php

namespace App\Services\Domain\User\Order\Calculators;

interface OrderCalculatorInterface
{
    public function calculate(OrderCalculationContext $context): void;
}
