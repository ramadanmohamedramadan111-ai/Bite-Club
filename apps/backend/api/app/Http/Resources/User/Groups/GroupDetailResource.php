<?php

namespace App\Http\Resources\User\Groups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\User\UserSearchResource;

class GroupDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'description'        => $this->description,
            'image_url'          => $this->image_url,
            'invite_token'       => $this->invite_token,
            'allow_join_by_link' => (bool) $this->allow_join_by_link,
            'status'             => $this->status instanceof \UnitEnum ? $this->status->value : $this->status,
            'owner'              => new UserSearchResource($this->owner),
            'members'            => GroupMemberResource::collection($this->members),
        ];
    }
}
