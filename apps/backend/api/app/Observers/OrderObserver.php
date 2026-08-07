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
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        $pendingCopy = \App\Models\OrderCopy::where('copied_by_user_id', $order->user_id)
            ->whereNull('copied_order_id')
            ->where('status', \App\Enums\Social\OrderCopyStatusEnum::PENDING->value)
            ->whereHas('originalOrder', function ($query) use ($order) {
                $query->where('restaurant_id', $order->restaurant_id);
            })
            ->first();

        if ($pendingCopy) {
            $pendingCopy->update(['copied_order_id' => $order->id]);
        }
    }

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
