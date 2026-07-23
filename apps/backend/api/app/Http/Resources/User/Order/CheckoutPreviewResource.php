<?php

namespace App\Http\Resources\User\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckoutPreviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cart_id' => $this['cart_id'],
            'order_type' => $this['order_type'],
            'items' => $this['items'],
            'financials' => [
                'subtotal' => $this['financials']['subtotal'],
                'delivery_fee' => $this['financials']['delivery_fee'],
                'service_fee' => $this['financials']['service_fee'],
                'discount_amount' => $this['financials']['discount_amount'] ?? 0,
                'points_redeemed' => $this['financials']['points_redeemed'] ?? 0,
                'total' => $this['financials']['total'],
            ],
            'deposit_rules' => [
                'requires_deposit' => $this['deposit_rules']['requires_deposit'],
                'deposit_percentage' => $this['deposit_rules']['deposit_percentage'],
                'deposit_amount' => $this['deposit_rules']['deposit_amount'],
                'remaining_amount' => $this['deposit_rules']['remaining_amount'],
            ],
            'available_payment_options' => $this['available_payment_options'],
            'internal_data' => [
                'system_commission' => $this['internal_data']['system_commission'],
            ],
        ];
    }
}
