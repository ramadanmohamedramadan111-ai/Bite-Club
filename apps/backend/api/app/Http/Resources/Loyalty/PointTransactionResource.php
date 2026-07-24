<?php

namespace App\Http\Resources\Loyalty;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'points'         => (int) $this->points,
            'type'           => $this->type->value ?? $this->type,
            'source'         => $this->source->value ?? $this->source,
            'reference_id'   => $this->reference_id,
            'reference_type' => $this->reference_type,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
