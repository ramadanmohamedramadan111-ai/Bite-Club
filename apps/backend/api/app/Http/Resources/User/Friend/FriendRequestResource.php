<?php

namespace App\Http\Resources\User\Friend;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use App\Traits\UrlFormatterTrait;

class FriendRequestResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'sender_id'     => $this->requester->id,
            'username'      => $this->requester->username,
            'full_name'     => $this->requester->full_name,
            'profile_image' => $this->formatImageUrl($this->requester->profile_image_url),
        ];
    }
}
