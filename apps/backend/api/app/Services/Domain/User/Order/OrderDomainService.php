<?php

namespace App\Services\Domain\User\Order;

use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\OrderItemRepositoryInterface;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;
use App\Services\Infrastructure\Payment\PaymentGatewayInterface;
use App\Models\GeneralSetting;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentOptionEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Order;
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
        private readonly CartRepositoryInterface $cartRepository,
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrderItemRepositoryInterface $orderItemRepository,
        private readonly OrderPaymentRepositoryInterface $orderPaymentRepository,
        private readonly PaymentGatewayInterface $paymentGateway
    ) {
        $this->calculators = [
            new SubtotalCalculator(),
            new DeliveryFeeCalculator(),
            new ServiceFeeCalculator(),
            new CommissionCalculator(),
            new DepositCalculator(),
        ];
    }

    public function previewCheckout(int $userId, string $orderType, ?float $lat, ?float $long, bool $isGroupOrder = false): array
    {
        $cart = $this->cartRepository->getUserCart($userId, $isGroupOrder);

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
                'id' => PaymentOptionEnum::SPLIT_PAYMENT->value,
                'title' => 'Pay Deposit Online, Remaining Cash',
                'description' => "Pay {$depositAmount} now to confirm your order, and the rest upon delivery.",
                'required_now' => [
                    'type' => PaymentTypeEnum::DEPOSIT->value,
                    'method' => PaymentMethodEnum::ONLINE->value,
                    'amount' => $depositAmount,
                ],
                'remaining_upon_delivery' => [
                    'type' => PaymentTypeEnum::REMAINING->value,
                    'method' => PaymentMethodEnum::CASH->value,
                    'amount' => round($context->remainingAmount, 2),
                ]
            ];
            $availablePaymentOptions[] = [
                'id' => PaymentOptionEnum::FULL_ONLINE->value,
                'title' => 'Pay Full Amount Online',
                'description' => "Pay the total {$totalAmount} now.",
                'required_now' => [
                    'type' => PaymentTypeEnum::FULL->value,
                    'method' => PaymentMethodEnum::ONLINE->value,
                    'amount' => $totalAmount,
                ]
            ];
        } else {
            $availablePaymentOptions[] = [
                'id' => PaymentOptionEnum::FULL_CASH->value,
                'title' => 'Pay Cash on Delivery',
                'description' => "Pay the total {$totalAmount} upon delivery.",
                'required_now' => [
                    'type' => PaymentTypeEnum::FULL->value,
                    'method' => PaymentMethodEnum::CASH->value,
                    'amount' => $totalAmount,
                ]
            ];
            $availablePaymentOptions[] = [
                'id' => PaymentOptionEnum::FULL_ONLINE->value,
                'title' => 'Pay Full Amount Online',
                'description' => "Pay the total {$totalAmount} now.",
                'required_now' => [
                    'type' => PaymentTypeEnum::FULL->value,
                    'method' => PaymentMethodEnum::ONLINE->value,
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

    public function placeOrder(int $userId, string $orderType, string $paymentOptionId, ?float $lat, ?float $long, bool $isGroupOrder = false): array
    {
        $preview = $this->previewCheckout($userId, $orderType, $lat, $long, $isGroupOrder);
        
        $selectedOption = null;
        foreach ($preview['available_payment_options'] as $option) {
            if ($option['id'] === $paymentOptionId) {
                $selectedOption = $option;
                break;
            }
        }

        if (!$selectedOption) {
            throw new Exception(trans('order.invalid_payment_option'));
        }

        $order = DB::transaction(function () use ($userId, $preview, $selectedOption, $isGroupOrder) {
            $cart = $this->cartRepository->getUserCart($userId, $isGroupOrder);

            $orderStatus = $selectedOption['required_now']['method'] === PaymentMethodEnum::ONLINE->value 
                ? OrderStatusEnum::AWAITING_PAYMENT->value 
                : OrderStatusEnum::PENDING->value;

            $order = $this->orderRepository->create([
                'user_id' => $userId,
                'restaurant_id' => $cart->restaurant_id,
                'order_type' => $preview['order_type'],
                'status' => $orderStatus,
                'subtotal' => $preview['financials']['subtotal'],
                'delivery_fee' => $preview['financials']['delivery_fee'],
                'service_fee' => $preview['financials']['service_fee'],
                'total' => $preview['financials']['total'],
            ]);

            foreach ($cart->items as $cartItem) {
                $this->orderItemRepository->create([
                    'order_id' => $order->id,
                    'item_id' => $cartItem->item_id,
                    'item_name' => $cartItem->item_name,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->unit_price,
                    'notes' => $cartItem->notes,
                ]);
            }

            $this->orderPaymentRepository->create([
                'order_id' => $order->id,
                'payment_type' => $selectedOption['required_now']['type'],
                'payment_method' => $selectedOption['required_now']['method'],
                'amount' => $selectedOption['required_now']['amount'],
                'status' => PaymentStatusEnum::PENDING->value,
            ]);

            if (isset($selectedOption['remaining_upon_delivery'])) {
                $this->orderPaymentRepository->create([
                    'order_id' => $order->id,
                    'payment_type' => $selectedOption['remaining_upon_delivery']['type'],
                    'payment_method' => $selectedOption['remaining_upon_delivery']['method'],
                    'amount' => $selectedOption['remaining_upon_delivery']['amount'],
                    'status' => PaymentStatusEnum::PENDING->value,
                ]);
            }

            $this->cartRepository->delete($cart->id);

            return $order;
        });

        $paymentUrl = null;
        if ($selectedOption['required_now']['method'] === PaymentMethodEnum::ONLINE->value) {
            $paymentUrl = $this->paymentGateway->createPaymentSession($order, $selectedOption['required_now']['amount']);
        }

        return [
            'order_id' => $order->id,
            'status' => $order->status->value,
            'payment_url' => $paymentUrl,
            'message' => trans('order.placed_successfully'),
        ];
    }

    public function getKashierApiKeyForOrder(int $orderId): ?string
    {
        $order = $this->orderRepository->find($orderId);
        return $order?->restaurant?->setting?->kashier_api_key;
    }

    public function handlePaymentWebhook(string $orderId, string $status, ?string $transactionId = null): void
    {
        try {
            DB::beginTransaction();

            $order = $this->orderRepository->find((int) $orderId);
            if (!$order) {
                Log::warning("Kashier Webhook: Order not found: {$orderId}");
                DB::rollBack();
                return;
            }

            $payment = $this->orderPaymentRepository->findPendingOnlinePaymentByOrderId($order->id);

            if (!$payment) {
                Log::warning("Kashier Webhook: No pending online payment found for Order: {$orderId}");
                DB::rollBack();
                return;
            }

            if ($status === 'SUCCESS') {
                $this->orderPaymentRepository->update($payment->id, [
                    'status' => PaymentStatusEnum::PAID->value,
                    'transaction_id' => $transactionId,
                ]);

                // Close the cycle: Move order to PENDING so restaurant can accept it
                $this->orderRepository->update($order->id, [
                    'status' => OrderStatusEnum::PENDING->value,
                ]);
            } else {
                $this->orderPaymentRepository->update($payment->id, [
                    'status' => PaymentStatusEnum::FAILED->value,
                    'transaction_id' => $transactionId,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Kashier Webhook Error processing payment: " . $e->getMessage());
        }
    }

    public function getActiveOrders(int $userId): Collection
    {
        return $this->orderRepository->getActiveOrdersForUser($userId);
    }

    public function getPastOrders(int $userId, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->orderRepository->getPaginatedPastOrdersForUser($userId, $page, $perPage);
    }

    public function getOrderDetails(int $orderId, int $userId): Order
    {
        $order = $this->orderRepository->findOrderForUser($orderId, $userId);

        if (!$order) {
            throw new NotFoundHttpException(trans('order.not_found') ?? 'Order not found.');
        }

        return $order;
    }
}
