<?php

namespace App\Http\Resources\User\Friend;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class FriendResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'username'      => $this->username,
            'full_name'     => $this->full_name,
            'profile_image' => $this->formatImageUrl($this->profile_image_url),
        ];
    }
}
