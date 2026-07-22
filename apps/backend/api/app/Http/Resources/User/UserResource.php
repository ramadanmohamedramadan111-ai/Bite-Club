<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profileImageUrl = $this->profile_image_url;
        if ($profileImageUrl) {
            $parsedUrl = parse_url($profileImageUrl);
            if (isset($parsedUrl['path'])) {
                $host = request()->header('host') ?: request()->getHttpHost();
                if (($host === 'api.localhost' || $host === 'localhost') && !str_contains($host, ':')) {
                    $host .= ':8080';
                }
                $profileImageUrl = request()->getScheme() . '://' . $host . '/' . ltrim($parsedUrl['path'], '/');
            }
        }

        return [
            'id'            => $this->id,
            'first_name'    => $this->first_name,
            'last_name'     => $this->last_name,
            'date_of_birth' => $this->date_of_birth instanceof \DateTimeInterface ? $this->date_of_birth->format('Y-m-d') : $this->date_of_birth,
            'username'      => $this->username,
            'email'         => $this->email,
            'phone_number'  => $this->phone_number,
            'profile_image' => $profileImageUrl,
            'gender'        => $this->gender,
            'status'        => $this->status->value ?? $this->status,
            'referral_code' => $this->referral_code,
            'last_login_at' => $this->last_login_at instanceof \DateTimeInterface ? $this->last_login_at->toIso8601String() : $this->last_login_at,
            'posts_count'   => (int) ($this->posts_count ?? $this->posts()->count()),
            'friends_count' => (int) ($this->friends_count ?? ($this->friendshipsAsLow()->count() + $this->friendshipsAsHigh()->count())),
        ];
    }
}
