<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceDetailsResource extends JsonResource
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
            'platform_dues' => PlatformDueResource::collection($this->whenLoaded('platformDues')),
        ];
    }
}
