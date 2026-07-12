<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use App\Enums\Auth\UserStatusEnum;


class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'phone_number',
        'firebase_uid',
        'username',
        'full_name',
        'email',
        'password_hash',
        'profile_image_url',
        'gender',
        'referral_code',
        'referred_by',
        'failed_pickup_count',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
            return [
                'referred_by'         => 'integer',
                'failed_pickup_count' => 'integer',
                'last_login_at'       => 'datetime',
                'deleted_at'          => 'datetime',
                'status'              => UserStatusEnum::class,
            ];
    }

    /**
     * JWT
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    /**
     * Tell Laravel which column stores the password.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function isActive(): bool
    { 
        return $this->status->isActive();
    }

    /**
     * Relationships
     */
    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(self::class, 'referred_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(self::class, 'referred_by');
    }
}