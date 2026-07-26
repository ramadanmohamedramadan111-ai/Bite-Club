<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'status'        => $this->status->value ?? $this->status,
            'last_login_at' => $this->last_login_at?->toIso8601String() ?? $this->last_login_at,
        ];
    }
}
