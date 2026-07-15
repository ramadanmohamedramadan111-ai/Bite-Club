<?php

namespace App\Http\Resources\User\Friend;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SentFriendRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'recipient_id'  => $this->addressee->id,
            'username'      => $this->addressee->username,
            'full_name'     => $this->addressee->full_name,
            'profile_image' => $this->addressee->profile_image_url,
        ];
    }
}
