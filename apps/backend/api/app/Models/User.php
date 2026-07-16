<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'requester_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'addressee_id');
    }

    public function friendshipsAsLow(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_low_id');
    }

    public function friendshipsAsHigh(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_high_id');
    }

    public function getFriendsAttribute()
    {
        $lows = $this->friendshipsAsLow()->with('highUser')->get()->pluck('highUser');
        $highs = $this->friendshipsAsHigh()->with('lowUser')->get()->pluck('lowUser');
        return $lows->concat($highs);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_members', 'user_id', 'group_id')
            ->withPivot('role', 'status', 'joined_at', 'left_at')
            ->withTimestamps();
    }

    public function activeGroups(): BelongsToMany
    {
        return $this->groups()->wherePivot('status', 'active');
    }

    public function restaurantReviews(): HasMany
    {
        return $this->hasMany(RestaurantReview::class, 'user_id');
    }
}
