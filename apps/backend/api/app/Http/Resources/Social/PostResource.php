<?php

namespace App\Http\Resources\Social;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id'                => $this->user?->id,
                'name'              => $this->user?->full_name,
                'username'          => $this->user?->username,
                'profile_image_url' => $this->user?->profile_image_url,
            ],
            'restaurant' => [
                'id'       => $this->restaurant?->id,
                'name'     => $this->restaurant?->name,
                'logo_url' => $this->restaurant?->logo_url,
            ],
            'images'            => PostImageResource::collection($this->whenLoaded('images')),
            'caption'           => $this->caption,
            'likes_count'       => $this->likes_count,
            'copy_count'        => $this->copy_count,
            'is_liked_by_user'  => (bool) ($this->is_liked_by_user ?? false),
            'status'            => $this->status?->value ?? $this->status,
            'published_at'      => $this->published_at?->toIso8601String(),
            'expires_at'        => $this->expires_at?->toIso8601String(),
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
