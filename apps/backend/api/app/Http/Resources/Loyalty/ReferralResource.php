<?php

namespace App\Http\Resources\Loyalty;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'referred_user' => [
                'id'                => $this->referred?->id,
                'name'              => $this->referred?->full_name,
                'username'          => $this->referred?->username,
                'profile_image_url' => $this->referred?->profile_image_url,
            ],
            'status'        => $this->status->value ?? $this->status,
            'completed_at'  => $this->completed_at?->toIso8601String(),
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}
