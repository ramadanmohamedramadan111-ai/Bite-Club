<?php

namespace App\Http\Resources\User\Groups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $joinedAt = $this->pivot && $this->pivot->joined_at 
            ? ($this->pivot->joined_at instanceof \Carbon\Carbon ? $this->pivot->joined_at : \Carbon\Carbon::parse($this->pivot->joined_at)) 
            : null;
        $leftAt = $this->pivot && $this->pivot->left_at 
            ? ($this->pivot->left_at instanceof \Carbon\Carbon ? $this->pivot->left_at : \Carbon\Carbon::parse($this->pivot->left_at)) 
            : null;

        return [
            'id'            => $this->id,
            'username'      => $this->username,
            'full_name'     => $this->full_name,
            'profile_image' => $this->profile_image_url,
            'role'          => $this->pivot ? $this->pivot->role : null,
            'status'        => $this->pivot ? $this->pivot->status : null,
            'joined_at'     => $joinedAt ? $joinedAt->toIso8601String() : null,
            'left_at'       => $leftAt ? $leftAt->toIso8601String() : null,
        ];
    }
}
