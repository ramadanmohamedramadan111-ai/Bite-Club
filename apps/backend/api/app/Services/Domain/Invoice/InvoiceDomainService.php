<?php

namespace App\Services\Domain\Invoice;

use App\Enums\Invoice\PlatformDueStatusEnum;
use App\Models\Order;
use App\Repositories\Interfaces\PlatformDueRepositoryInterface;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class InvoiceDomainService
{
    public function __construct(
        private PlatformDueRepositoryInterface $platformDueRepository,
        private GeneralSettingRepositoryInterface $generalSettingRepository
    ) {}

    public function capturePlatformDue(Order $order): void
    {
        $generalSetting = $this->generalSettingRepository->first();
        $commissionRate = $generalSetting ? (float) $generalSetting->commission_rate : 0.0;
        $commissionAmount = ($order->subtotal * $commissionRate) / 100;
        $totalDue = $commissionAmount + $order->service_fee;

        $this->platformDueRepository->firstOrCreateForOrder(
            $order->id,
            [
                'restaurant_id' => $order->restaurant_id,
                'commission_rate' => round($commissionRate, 2),
                'commission_amount' => round($commissionAmount, 2),
                'service_fee' => round($order->service_fee, 2),
                'total_due' => round($totalDue, 2),
                'invoice_status' => PlatformDueStatusEnum::UNINVOICED->value,
            ]
        );
    }
}
