<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
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
            'amount' => $this->amount,
            'billing_start_date' => $this->billing_start_date->toDateString(),
            'billing_end_date' => $this->billing_end_date->toDateString(),
            'due_date' => $this->due_date->toDateString(),
            'status' => $this->status,
            'payment_gateway_ref' => $this->payment_gateway_ref,
            'created_at' => $this->created_at->toDateTimeString(),
            'restaurant' => $this->whenLoaded('restaurant', function () {
                return [
                    'id' => $this->restaurant->id,
                    'name' => $this->restaurant->name,
                ];
            }),
            'platform_dues' => $this->whenLoaded('platformDues'),
        ];
    }
}
