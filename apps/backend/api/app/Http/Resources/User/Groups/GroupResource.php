<?php

namespace App\Http\Resources\User\Groups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\User\UserSearchResource;
use App\Traits\UrlFormatterTrait;

class GroupResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        $currentUser = auth('user')->user();
        $myRole = null;
        
        if ($currentUser && $this->relationLoaded('members')) {
            $member = $this->members->firstWhere('id', $currentUser->id);
            if ($member && $member->pivot) {
                $myRole = $member->pivot->role;
            }
        }

        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'description'             => $this->description,
            'image_url'               => $this->formatImageUrl($this->image_url),
            'members_count'           => (int) ($this->active_members_count ?? $this->activeMembers()->count()),
            'my_role'                 => $myRole,
            'owner'                   => new UserSearchResource($this->owner),
            'allow_join_by_link'      => (bool) $this->allow_join_by_link,
            'allow_guests_for_orders' => (bool) $this->allow_guests_for_orders,
            'status'                  => $this->status instanceof \UnitEnum ? $this->status->value : $this->status,
        ];
    }
}
