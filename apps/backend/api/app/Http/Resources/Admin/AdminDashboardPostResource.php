<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class AdminDashboardPostResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        $firstImage = $this->images->first();
        $imageUrl = $firstImage ? $this->formatImageUrl($firstImage->image_url) : null;

        return [
            'id'          => $this->id,
            'image_url'   => $imageUrl,
            'caption'     => $this->caption,
            'copy_count'  => (int) $this->copy_count,
            'created_at'  => $this->created_at?->toIso8601String(),
            'user'        => [
                'id'        => $this->user?->id,
                'full_name' => $this->user?->full_name,
            ],
            'restaurant'  => [
                'id'   => $this->restaurant?->id,
                'name' => $this->restaurant?->name,
            ],
        ];
    }
}
