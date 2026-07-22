<?php

namespace App\Http\Resources\Admin\UserManagement;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $activeBan = $this->activeBan;
        $banDetails = null;

        if ($activeBan) {
            $banDetails = [
                'id'         => $activeBan->id,
                'reason'     => $activeBan->reason,
                'banned_at'  => $activeBan->banned_at,
                'banned_by'  => $activeBan->bannedBy ? [
                    'id'    => $activeBan->bannedBy->id,
                    'name'  => $activeBan->bannedBy->name,
                    'email' => $activeBan->bannedBy->email,
                ] : null,
            ];
        }

        return [
            'id'                  => $this->id,
            'username'            => $this->username,
            'first_name'          => $this->first_name,
            'last_name'           => $this->last_name,
            'full_name'           => $this->full_name,
            'email'               => $this->email,
            'phone_number'        => $this->phone_number,
            'profile_image_url'   => $this->profile_image_url,
            'gender'              => $this->gender,
            'date_of_birth'       => $this->date_of_birth?->format('Y-m-d'),
            'referral_code'       => $this->referral_code,
            'referred_by'         => $this->referred_by,
            'failed_pickup_count' => $this->failed_pickup_count,
            'status'              => $this->status->value ?? $this->status,
            'email_verified_at'   => $this->email_verified_at,
            'join_date'           => $this->created_at,
            'last_login'          => $this->last_login_at,
            'orders_count'        => Order::where('user_id', $this->id)->count(),
            'active_ban'          => $banDetails,
        ];
    }
}
