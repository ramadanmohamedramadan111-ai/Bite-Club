<?php

namespace App\Services\Domain\Invoice;

use App\Enums\Invoice\PlatformDueStatusEnum;
use App\Enums\Invoice\InvoiceStatusEnum;
use App\Models\Order;
use App\Repositories\Interfaces\PlatformDueRepositoryInterface;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;
use App\Repositories\Interfaces\InvoiceRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceDomainService
{
    public function __construct(
        private PlatformDueRepositoryInterface $platformDueRepository,
        private GeneralSettingRepositoryInterface $generalSettingRepository,
        private InvoiceRepositoryInterface $invoiceRepository
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

    public function generateMonthlyInvoices(): int
    {
        $groupedDues = $this->platformDueRepository->getUninvoicedDuesGroupedByRestaurant();
        $invoicesCreatedCount = 0;

        foreach ($groupedDues as $restaurantId => $dues) {
            try {
                DB::transaction(function () use ($restaurantId, $dues, &$invoicesCreatedCount) {
                    $totalAmount = $dues->sum('total_due');

                    // Assume billing cycle is the previous month
                    $startDate = now()->subMonth()->startOfMonth()->toDateString();
                    $endDate = now()->subMonth()->endOfMonth()->toDateString();
                    $dueDate = now()->addDays(5)->toDateString(); // Due in 5 days

                    // Create the Invoice
                    $invoice = $this->invoiceRepository->create([
                        'restaurant_id' => $restaurantId,
                        'amount' => round($totalAmount, 2),
                        'billing_start_date' => $startDate,
                        'billing_end_date' => $endDate,
                        'due_date' => $dueDate,
                        'status' => InvoiceStatusEnum::UNPAID->value,
                    ]);

                    // Update all platform_dues to be invoiced
                    $dueIds = $dues->pluck('id')->toArray();
                    $this->platformDueRepository->markAsInvoiced($dueIds, $invoice->id);

                    $invoicesCreatedCount++;
                });
            } catch (\Exception $e) {
                Log::error("Failed to generate invoice for Restaurant ID {$restaurantId}: " . $e->getMessage());
            }
        }

        return $invoicesCreatedCount;
    }
}
