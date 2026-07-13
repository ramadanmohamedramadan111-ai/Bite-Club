<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhoneVerification extends Model
{
    protected $fillable = [
        'phone_number',
        'otp',
        'expires_at',
        'verified_at',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return now()->greaterThan($this->expires_at);
    }

    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }
}
