<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetOtp extends Model
{
    protected $table = 'password_reset_otps';

    protected $fillable = [
        'email',
        'otp_hash',
        'is_verified',
        'expires_at',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'attempts'    => 'integer',
            'expires_at'  => 'datetime',
        ];
    }
}
