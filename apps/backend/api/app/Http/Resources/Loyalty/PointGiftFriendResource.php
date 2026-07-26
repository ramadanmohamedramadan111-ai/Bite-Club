<?php

namespace App\Http\Resources\Loyalty;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointGiftFriendResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'full_name'         => $this->full_name,
            'username'          => $this->username,
            'profile_image_url' => $this->profile_image_url,
        ];
    }
}
