<?php

namespace App\Http\Resources\Admin\UserManagement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserBanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'reason'        => $this->reason,
            'banned_at'     => $this->banned_at,
            'lifted_at'     => $this->lifted_at,
            'lifted_reason' => $this->lifted_reason,
            'user'          => $this->user ? [
                'id'        => $this->user->id,
                'username'  => $this->user->username,
                'full_name' => $this->user->full_name,
                'email'     => $this->user->email,
            ] : null,
            'banned_by'     => $this->bannedBy ? [
                'id'    => $this->bannedBy->id,
                'name'  => $this->bannedBy->name,
                'email' => $this->bannedBy->email,
            ] : null,
            'lifted_by'     => $this->liftedBy ? [
                'id'    => $this->liftedBy->id,
                'name'  => $this->liftedBy->name,
                'email' => $this->liftedBy->email,
            ] : null,
        ];
    }
}
