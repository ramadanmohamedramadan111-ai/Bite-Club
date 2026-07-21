<?php

namespace App\Http\Resources\Social;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'rank'          => $this->rank,
            'user'          => [
                'id'                => $this->user?->id,
                'name'              => $this->user?->full_name,
                'username'          => $this->user?->username,
                'profile_image_url' => $this->user?->profile_image_url,
            ],
            'copies'        => $this->copies,
            'reward_points' => $this->reward_points,
            'type'          => $this->type?->value ?? $this->type,
            'period_start'  => $this->period_start?->toIso8601String(),
            'period_end'    => $this->period_end?->toIso8601String(),
        ];
    }
}
