<?php

namespace App\Http\Resources\Loyalty;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointGiftResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = auth('user')->id();
        $isSender = $this->sender_user_id === $userId;
        $otherUser = $isSender ? $this->receiver : $this->sender;

        return [
            'id'         => $this->id,
            'type'       => $isSender ? 'sent' : 'received',
            'user'       => [
                'id'                => $otherUser?->id,
                'full_name'         => $otherUser?->full_name,
                'username'          => $otherUser?->username,
                'profile_image_url' => $otherUser?->profile_image_url,
            ],
            'points'     => (int) $this->points,
            'note'       => $this->note,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
