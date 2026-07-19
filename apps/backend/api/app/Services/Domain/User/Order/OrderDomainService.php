<?php

namespace App\Services\Domain\User\Order;

use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Models\GeneralSetting;
use App\Enums\Order\OrderTypeEnum;
use Exception;

use App\Services\Domain\User\Order\Calculators\OrderCalculationContext;
use App\Services\Domain\User\Order\Calculators\SubtotalCalculator;
use App\Services\Domain\User\Order\Calculators\DeliveryFeeCalculator;
use App\Services\Domain\User\Order\Calculators\ServiceFeeCalculator;
use App\Services\Domain\User\Order\Calculators\CommissionCalculator;
use App\Services\Domain\User\Order\Calculators\DepositCalculator;

class OrderDomainService
{
    private array $calculators = [];

    public function __construct(
        private readonly CartRepositoryInterface $cartRepository
    ) {
        $this->calculators = [
            new SubtotalCalculator(),
            new DeliveryFeeCalculator(),
            new ServiceFeeCalculator(),
            new CommissionCalculator(),
            new DepositCalculator(),
        ];
    }

    public function previewCheckout(int $userId, string $orderType, ?float $lat, ?float $long): array
    {
        $cart = $this->cartRepository->getUserCart($userId);

        if (!$cart) {
            throw new Exception(trans('order.cart_not_found'));
        }

        if ($cart->items->isEmpty()) {
            throw new Exception(trans('order.empty_cart'));
        }

        $restaurant = $cart->restaurant;
        $restaurantSetting = $restaurant->setting;

        if (!$restaurantSetting) {
            throw new Exception(trans('order.restaurant_unavailable'));
        }

        if (!$restaurantSetting->accept_orders || !$restaurantSetting->is_open) {
            throw new Exception(trans('order.restaurant_closed'));
        }

        if ($orderType === OrderTypeEnum::DELIVERY->value && !$restaurantSetting->delivery_enabled) {
            throw new Exception(trans('order.delivery_not_available'));
        }

        if ($orderType === OrderTypeEnum::PICKUP->value && !$restaurantSetting->pickup_enabled) {
            throw new Exception(trans('order.pickup_not_available'));
        }

        $generalSetting = GeneralSetting::first();

        $context = new OrderCalculationContext(
            cart: $cart,
            restaurantSetting: $restaurantSetting,
            generalSetting: $generalSetting,
            orderType: $orderType,
            lat: $lat,
            long: $long
        );

        foreach ($this->calculators as $calculator) {
            $calculator->calculate($context);
        }

        $items = $cart->items->map(function ($item) {
            return [
                'item_id' => $item->item_id,
                'name' => $item->item_name,
                'quantity' => $item->quantity,
                'unit_price' => round($item->unit_price, 2),
                'total_price' => round($item->quantity * $item->unit_price, 2),
            ];
        })->toArray();

        $depositAmount = round($context->depositAmount, 2);
        $totalAmount = round($context->total, 2);
        $availablePaymentOptions = [];

        if ($context->requiresDeposit) {
            $availablePaymentOptions[] = [
                'id' => 'split_payment',
                'title' => 'Pay Deposit Online, Remaining Cash',
                'description' => "Pay {$depositAmount} now to confirm your order, and the rest upon delivery.",
                'required_now' => [
                    'type' => 'deposit',
                    'method' => 'online',
                    'amount' => $depositAmount,
                ]
            ];
            $availablePaymentOptions[] = [
                'id' => 'full_online',
                'title' => 'Pay Full Amount Online',
                'description' => "Pay the total {$totalAmount} now.",
                'required_now' => [
                    'type' => 'full',
                    'method' => 'online',
                    'amount' => $totalAmount,
                ]
            ];
        } else {
            $availablePaymentOptions[] = [
                'id' => 'full_cash',
                'title' => 'Pay Cash on Delivery',
                'description' => "Pay the total {$totalAmount} upon delivery.",
                'required_now' => [
                    'type' => 'full',
                    'method' => 'cash',
                    'amount' => $totalAmount,
                ]
            ];
            $availablePaymentOptions[] = [
                'id' => 'full_online',
                'title' => 'Pay Full Amount Online',
                'description' => "Pay the total {$totalAmount} now.",
                'required_now' => [
                    'type' => 'full',
                    'method' => 'online',
                    'amount' => $totalAmount,
                ]
            ];
        }

        return [
            'cart_id' => $cart->id,
            'order_type' => $orderType,
            'items' => $items,
            'financials' => [
                'subtotal' => round($context->subtotal, 2),
                'delivery_fee' => round($context->deliveryFee, 2),
                'service_fee' => round($context->serviceFee, 2),
                'total' => round($context->total, 2),
            ],
            'deposit_rules' => [
                'requires_deposit' => $context->requiresDeposit,
                'deposit_percentage' => round($context->depositPercentage, 2),
                'deposit_amount' => round($context->depositAmount, 2),
                'remaining_amount' => round($context->remainingAmount, 2),
            ],
            'available_payment_options' => $availablePaymentOptions,
            'internal_data' => [
                'system_commission' => round($context->systemCommission, 2),
            ]
        ];
    }
}
