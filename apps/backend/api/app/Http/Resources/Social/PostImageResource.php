<?php

namespace App\Http\Resources\Social;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class PostImageResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'image_url' => $this->formatImageUrl($this->image_url),
            'position'  => $this->position,
        ];
    }
}
