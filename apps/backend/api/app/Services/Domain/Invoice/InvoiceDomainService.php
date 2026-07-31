<?php

namespace App\Services\Domain\Invoice;

use \App\Models\Invoice;
use \App\Services\Infrastructure\Payment\KashierPaymentGateway;
use App\Enums\Invoice\InvoiceStatusEnum;
use App\Enums\Invoice\PlatformDueStatusEnum;
use App\Models\Order;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;
use App\Repositories\Interfaces\InvoiceRepositoryInterface;
use App\Repositories\Interfaces\PlatformDueRepositoryInterface;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceDomainService
{
    public function __construct(
        private PlatformDueRepositoryInterface $platformDueRepository,
        private GeneralSettingRepositoryInterface $generalSettingRepository,
        private InvoiceRepositoryInterface $invoiceRepository,
        private RestaurantRepositoryInterface $restaurantRepository,
        private KashierPaymentGateway $kashierPaymentGateway
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
                    $dueDate =  now()->subMonth()->endOfMonth()->toDateString(); // Due in 5 days

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

    public function checkAndProcessOverdueInvoices(): int
    {
        $overdueInvoices = $this->invoiceRepository->getUnpaidOverdueInvoices();

        if ($overdueInvoices->isEmpty()) {
            return 0;
        }

        $invoiceIds = $overdueInvoices->pluck('id')->toArray();
        $restaurantIds = $overdueInvoices->pluck('restaurant_id')->unique()->toArray();

        DB::transaction(function () use ($invoiceIds, $restaurantIds) {
            $this->invoiceRepository->markAsOverdue($invoiceIds);
            $this->restaurantRepository->suspendRestaurants($restaurantIds);
        });

        return count($invoiceIds);
    }

    public function getRestaurantInvoices(int $restaurantId, array $filters, int $perPage = 15): array
    {
        return $this->invoiceRepository->getForRestaurant($restaurantId, $filters, $perPage);
    }

    public function getAllInvoices(array $filters, int $perPage = 15): array
    {
        return $this->invoiceRepository->getAllInvoices($filters, $perPage);
    }

    public function getAdminInvoiceDetails(int $id): Invoice
    {
        $invoice = $this->invoiceRepository->findByIdWithDetails($id);

        if (!$invoice) {
            throw new \DomainException(trans('invoice.not_found') ?? 'Invoice not found.');
        }

        return $invoice;
    }

    public function getRestaurantInvoiceDetails(int $id, int $restaurantId): Invoice
    {
        $invoice = $this->invoiceRepository->findByIdForRestaurant($id, $restaurantId);

        if (!$invoice) {
            throw new \DomainException(trans('invoice.not_found') ?? 'Invoice not found.');
        }

        return $invoice;
    }

    public function payInvoice(int $id, int $restaurantId): string
    {
        $invoice = $this->getRestaurantInvoiceDetails($id, $restaurantId);

        if ($invoice->status === InvoiceStatusEnum::PAID) {
            throw new \DomainException(trans('invoice.already_paid') ?? 'Invoice is already paid.');
        }

        $sessionUrl = $this->kashierPaymentGateway->createInvoicePaymentSession($invoice);

        if (!$sessionUrl) {
            throw new \DomainException(trans('invoice.payment_failed') ?? 'Failed to initialize payment session.');
        }

        return $sessionUrl;
    }

    public function handlePaymentWebhook(string $orderId, string $status, ?string $transactionId = null): void
    {
        // $orderId looks like "INV-1-1701234567"
        if (str_starts_with($orderId, 'INV-')) {
            $parts = explode('-', $orderId);
            if (count($parts) >= 2) {
                $invoiceId = (int) $parts[1];
            } else {
                return;
            }
        } else {
            return;
        }

        $invoice = $this->invoiceRepository->find($invoiceId);

        if (!$invoice) {
            Log::error("Invoice Webhook Error: Invoice not found for ID: {$invoiceId}");
            return;
        }

        if ($status === 'SUCCESS' && $invoice->status !== InvoiceStatusEnum::PAID) {
            DB::transaction(function () use ($invoice, $transactionId) {
                // 1. Mark Invoice as PAID
                $this->invoiceRepository->update($invoice->id, [
                    'status' => InvoiceStatusEnum::PAID->value,
                    'payment_gateway_ref' => $transactionId ?? 'Kashier_Webhook',
                    'paid_at' => now(),
                ]);

                // 2. Check if the restaurant has ANY other overdue invoices
                if (!$this->invoiceRepository->hasOverdueInvoices($invoice->restaurant_id)) {
                    // Unsuspend restaurant
                    $this->restaurantRepository->activateRestaurant($invoice->restaurant_id);
                }
            });
        }
    }
}
