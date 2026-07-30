<?php

namespace App\Http\Resources\Restaurant\Review;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class RestaurantReviewResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        $profileImageUrl = $this->user ? $this->formatImageUrl($this->user->profile_image_url) : null;

        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user ? trim($this->user->first_name . ' ' . $this->user->last_name) : null,
                'profile_image' => $profileImageUrl,
            ],
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
