<?php

namespace App\Services\Domain\Restaurant\Order\Support;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Models\Order;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;
use DomainException;

class OrderStatusTransition
{
    public function __construct(
        private readonly OrderPaymentRepositoryInterface $paymentRepository
    ) {}

    private function transitions(): array
    {
        return [
            OrderStatusEnum::AWAITING_PAYMENT->value => [],
            OrderStatusEnum::PENDING->value => [
                OrderStatusEnum::PREPARING->value,
                OrderStatusEnum::CANCELLED->value,
            ],
            OrderStatusEnum::PREPARING->value => [
                OrderStatusEnum::READY->value,
            ],
            OrderStatusEnum::READY->value => [
                OrderStatusEnum::OUT_FOR_DELIVERY->value,
                OrderStatusEnum::COMPLETED->value,
            ],
            OrderStatusEnum::OUT_FOR_DELIVERY->value => [
                OrderStatusEnum::COMPLETED->value,
            ],
            OrderStatusEnum::COMPLETED->value => [],
            OrderStatusEnum::CANCELLED->value => [],
        ];
    }

    public function getAvailableTransitions(Order $order): array
    {
        $status = $order->status;
        if (is_string($status)) {
            $status = OrderStatusEnum::tryFrom($status);
        }
        
        if (!$status) return [];

        $transitions = $this->transitions()[$status->value] ?? [];

        // Remove CANCELLED if order has online payment (Full or Deposit)
        if ($status === OrderStatusEnum::PENDING) {
            if ($this->paymentRepository->hasOnlinePayment($order->id)) {
                $transitions = array_values(array_filter($transitions, fn($t) => $t !== OrderStatusEnum::CANCELLED->value));
            }
        }

        // Remove OUT_FOR_DELIVERY if order is pickup
        if ($order->order_type === OrderTypeEnum::PICKUP->value) {
            $transitions = array_values(array_filter($transitions, fn($t) => $t !== OrderStatusEnum::OUT_FOR_DELIVERY->value));
        }

        return $transitions;
    }

    public function can(
        Order $order,
        OrderStatusEnum $to
    ): bool {
        return in_array(
            $to->value,
            $this->getAvailableTransitions($order),
            true
        );
    }

    public function assert(
        Order $order,
        OrderStatusEnum $to
    ): void {
        if (!$this->can($order, $to)) {
            $from = is_string($order->status) ? $order->status : $order->status->value;
            throw new DomainException(
                "Cannot change order status from {$from} to {$to->value}."
            );
        }
    }
}
