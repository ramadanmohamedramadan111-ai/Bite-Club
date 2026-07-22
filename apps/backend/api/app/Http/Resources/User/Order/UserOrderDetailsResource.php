<?php

namespace App\Http\Resources\User\Order;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserOrderDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_type' => $this->order_type,
            'status' => $this->status,
            'restaurant' => [
                'id' => $this->restaurant->id ?? null,
                'name' => $this->restaurant->name ?? null,
                'address' => $this->restaurant->address ?? null,
            ],
            'financials' => [
                'subtotal' => (float) $this->subtotal,
                'delivery_fee' => (float) $this->delivery_fee,
                'service_fee' => (float) $this->service_fee,
                'total' => (float) $this->total,
            ],
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_id' => $item->item_id,
                    'item_name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total_price' => (float) ($item->price * $item->quantity),
                    'notes' => $item->notes,
                ];
            }),
            'payments' => $this->payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_type' => $payment->payment_type,
                    'payment_method' => $payment->payment_method,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                ];
            }),
            'tracking' => $this->getTrackingInfo(),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'time_ago' => $this->created_at->diffForHumans(),
        ];
    }

    private function getTrackingInfo(): array
    {
        $status = $this->status instanceof OrderStatusEnum ? $this->status : OrderStatusEnum::tryFrom($this->status);
        $type = $this->order_type instanceof OrderTypeEnum ? $this->order_type : OrderTypeEnum::tryFrom($this->order_type);

        if ($status === OrderStatusEnum::CANCELLED) {
            return [
                'is_cancelled' => true,
                'message' => trans('order.tracking.cancelled') ?? 'Order was cancelled.',
                'steps' => []
            ];
        }

        $allSteps = [];
        
        if ($type === OrderTypeEnum::PICKUP) {
            $allSteps = [
                OrderStatusEnum::PENDING,
                OrderStatusEnum::PREPARING,
                OrderStatusEnum::READY,
                OrderStatusEnum::COMPLETED,
            ];
        } else {
            $allSteps = [
                OrderStatusEnum::PENDING,
                OrderStatusEnum::PREPARING,
                OrderStatusEnum::READY,
                OrderStatusEnum::OUT_FOR_DELIVERY,
                OrderStatusEnum::COMPLETED,
            ];
        }

        // If it's AWAITING_PAYMENT, we prepend it
        if ($status === OrderStatusEnum::AWAITING_PAYMENT) {
            array_unshift($allSteps, OrderStatusEnum::AWAITING_PAYMENT);
        }

        $currentIndex = array_search($status, $allSteps);
        if ($currentIndex === false) {
            $currentIndex = 0; // Default fallback
        }

        $stepsResponse = [];
        foreach ($allSteps as $index => $stepStatus) {
            $state = 'pending';
            if ($index < $currentIndex) {
                $state = 'completed';
            } elseif ($index === $currentIndex) {
                $state = 'active';
            }

            $stepsResponse[] = [
                'status' => $stepStatus->value,
                'label' => trans("order.tracking.status.{$stepStatus->value}") ?? ucfirst(str_replace('_', ' ', $stepStatus->value)),
                'state' => $state,
            ];
        }

        return [
            'is_cancelled' => false,
            'current_step' => $currentIndex + 1,
            'total_steps' => count($allSteps),
            'steps' => $stepsResponse
        ];
    }
}
