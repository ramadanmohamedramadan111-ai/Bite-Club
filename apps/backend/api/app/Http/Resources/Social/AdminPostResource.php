<?php

namespace App\Http\Resources\Social;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id'       => $this->user?->id,
                'name'     => $this->user?->full_name,
                'username' => $this->user?->username,
                'email'    => $this->user?->email,
            ],
            'restaurant' => [
                'id'   => $this->restaurant?->id,
                'name' => $this->restaurant?->name,
            ],
            'order' => [
                'id'    => $this->order?->id,
                'total' => $this->order?->total,
                'items' => $this->order?->items?->map(fn ($item) => [
                    'item_name' => $item->item_name,
                    'quantity'  => $item->quantity,
                    'price'     => $item->price,
                ]),
            ],
            'caption'          => $this->caption,
            'images'           => PostImageResource::collection($this->whenLoaded('images')),
            'status'           => $this->status?->value ?? $this->status,
            'reviewed_by'      => $this->reviewer ? [
                'id'   => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'reviewed_at'      => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'likes_count'      => $this->likes_count,
            'copy_count'       => $this->copy_count,
            'published_at'     => $this->published_at?->toIso8601String(),
            'expires_at'       => $this->expires_at?->toIso8601String(),
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
