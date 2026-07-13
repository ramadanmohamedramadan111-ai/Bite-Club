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
        'first_name',
        'last_name',
        'date_of_birth',
        'email',
        'password_hash',
        'profile_image_url',
        'gender',
        'referral_code',
        'referred_by',
        'failed_pickup_count',
        'status',
        'email_verified_at',
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
            'date_of_birth'       => 'date',
            'email_verified_at'   => 'datetime',
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
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
