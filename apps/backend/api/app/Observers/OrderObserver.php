<?php

namespace App\Observers;

use App\Models\Order;
use App\Enums\Order\OrderStatusEnum;
use App\Services\Domain\Loyalty\ReferralDomainService;
use App\Services\Domain\Loyalty\WeeklyStreakDomainService;

class OrderObserver
{
    public function __construct(
        private readonly ReferralDomainService $referralDomainService,
        private readonly WeeklyStreakDomainService $weeklyStreakDomainService
    ) {}

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        if ($order->isDirty('status') && $order->status === OrderStatusEnum::COMPLETED) {
            $this->referralDomainService->handleReferredUserFirstOrder($order);
            $this->weeklyStreakDomainService->handleCompletedOrder($order);
        }
    }
}
