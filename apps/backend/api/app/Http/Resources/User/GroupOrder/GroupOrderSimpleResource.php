<?php

namespace App\Http\Resources\User\GroupOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupOrderSimpleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'group_id' => $this->group_id,
            'group_name' => $this->group->name ?? null,
            'restaurant_id' => $this->restaurant_id,
            'restaurant_name' => $this->restaurant->name ?? null,
        ];
    }
}
