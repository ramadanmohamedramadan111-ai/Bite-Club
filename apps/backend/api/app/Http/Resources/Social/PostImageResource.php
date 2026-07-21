<?php

namespace App\Http\Resources\Social;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imageUrl = $this->image_url;

        if ($imageUrl) {
            $path = parse_url($imageUrl, PHP_URL_PATH) ?? '';
            if ($path) {
                $scheme = $request->getScheme();
                $host = $request->header('host') ?? $request->getHost();

                // If host is localhost domain without port, attach port 8080
                if (str_contains($host, 'localhost') && !str_contains($host, ':')) {
                    $host .= ':8080';
                }

                $imageUrl = "{$scheme}://{$host}{$path}";
            }
        }

        return [
            'id'        => $this->id,
            'image_url' => $imageUrl,
            'position'  => $this->position,
        ];
    }
}
