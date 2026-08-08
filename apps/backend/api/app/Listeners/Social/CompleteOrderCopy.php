<?php

namespace App\Listeners\Social;

use App\Events\OrderStatusUpdated;
use App\Enums\Order\OrderStatusEnum;
use App\Services\Domain\Social\OrderCopyDomainService;
use Illuminate\Support\Facades\Log;

class CompleteOrderCopy
{
    public function __construct(
        private readonly OrderCopyDomainService $orderCopyDomainService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;

        Log::info("CompleteOrderCopy Listener: OrderStatusUpdated event received for order ID {$order->id}, status: " . ($order->status instanceof \UnitEnum ? $order->status->value : $order->status));

        $statusValue = $order->status instanceof \UnitEnum ? $order->status->value : $order->status;

        if ($statusValue === OrderStatusEnum::COMPLETED->value) {
            Log::info("CompleteOrderCopy Listener: Completing order copy for order ID {$order->id}");
            $this->orderCopyDomainService->completeCopiedOrder($order->id);
        } elseif ($statusValue === OrderStatusEnum::CANCELLED->value) {
            Log::info("CompleteOrderCopy Listener: Cancelling order copy for order ID {$order->id}");
            $this->orderCopyDomainService->cancelCopiedOrder($order->id);
        }
    }
}
