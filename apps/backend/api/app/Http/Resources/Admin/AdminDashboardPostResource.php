<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDashboardPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $firstImage = $this->images->first();
        $imageUrl = null;
        if ($firstImage && $firstImage->image_url) {
            $imageUrl = $firstImage->image_url;
            $path = parse_url($imageUrl, PHP_URL_PATH) ?? '';
            if ($path) {
                $scheme = $request->getScheme();
                $host = $request->header('host') ?? $request->getHost();

                if (str_contains($host, 'localhost') && !str_contains($host, ':')) {
                    $host .= ':8080';
                }

                $imageUrl = "{$scheme}://{$host}{$path}";
            }
        }

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
