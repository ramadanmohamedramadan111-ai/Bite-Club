<?php

namespace App\Services\Domain\Restaurant\Order;

use \App\Events\OrderStatusUpdated;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentStatusEnum;
use App\Models\Order;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Services\Domain\Restaurant\Order\Support\OrderStatusTransition;
use App\Services\Domain\Invoice\InvoiceDomainService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RestaurantOrderDomainService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrderStatusTransition $statusTransition,
        private readonly OrderPaymentRepositoryInterface $paymentRepository,
        private readonly InvoiceDomainService $invoiceDomainService
    ) {
    }

    public function getLiveOrders(int $restaurantId): Collection
    {
        return $this->orderRepository->getLiveOrdersForRestaurant($restaurantId);
    }

    public function getAvailableStatuses(int $orderId, int $restaurantId): array
    {
        $order = $this->orderRepository->findOrderForRestaurant($orderId, $restaurantId);

        if (!$order) {
            throw new NotFoundHttpException(trans('order.not_found') ?? 'Order not found.');
        }

        return $this->statusTransition->getAvailableTransitions($order);
    }

    public function updateOrderStatus(int $orderId, int $restaurantId, string $status): Order
    {
        $order = $this->orderRepository->findOrderForRestaurant($orderId, $restaurantId);

        if (!$order) {
            throw new NotFoundHttpException(trans('order.not_found') ?? 'Order not found.');
        }

        $statusEnum = OrderStatusEnum::tryFrom($status);
        if (!$statusEnum) {
            throw new \InvalidArgumentException('Invalid order status.');
        }

        // Validate the transition
        $this->statusTransition->assert($order, $statusEnum);

        DB::transaction(function () use ($order, $statusEnum) {
            // Perform the update
            $this->orderRepository->update($order->id, ['status' => $statusEnum->value]);

            // Handle payments logic based on status
            if ($statusEnum === OrderStatusEnum::COMPLETED) {
                $this->paymentRepository->updatePendingPaymentsStatus($order->id, PaymentStatusEnum::PAID->value);

                // Capture Platform Dues 
                $this->invoiceDomainService->capturePlatformDue($order);

            } elseif ($statusEnum === OrderStatusEnum::CANCELLED) {
                $this->paymentRepository->updatePendingPaymentsStatus($order->id, PaymentStatusEnum::FAILED->value);
            }
        });

        // Refresh the order to return updated data
        $updatedOrder = $this->orderRepository->findOrderForRestaurant($orderId, $restaurantId);

        broadcast(new OrderStatusUpdated($updatedOrder));

        return $updatedOrder;
    }

    public function getOrderHistory(int $restaurantId, array $filters, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->orderRepository->getPaginatedOrderHistory($restaurantId, $filters, $page, $perPage);
    }
}
