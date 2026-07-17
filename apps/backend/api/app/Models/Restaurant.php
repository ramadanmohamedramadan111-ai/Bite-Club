<?php

namespace App\Models;

use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Facades\Mail;
use App\Mail\Restaurant\ResetPasswordMail;

class Restaurant extends Authenticatable implements JWTSubject
{
    use HasFactory, SoftDeletes;

    public function sendPasswordResetNotification($token): void
    {
        Mail::to($this->email)->send(new ResetPasswordMail($token, $this->email));
    }

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'phone_number',
        'category_id',
        'description',
        'logo_url',
        'cover_image_url',
        'address',
        'status',
        'approved_at',
        'approved_by',
        'average_rating',
        'reviews_count',
        'total_orders_count',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'status'      => RestaurantStatusEnum::class,
            'approved_at' => 'datetime',
        ];
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function canLogin(): bool
    {
        return $this->status->canLogin();
    }

    public function isPendingApproval(): bool
    {
        return $this->status->isPendingApproval();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RestaurantCategory::class, 'category_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function menuCategories(): HasMany
    {
        return $this->hasMany(MenuCategory::class, 'restaurant_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(RestaurantReview::class, 'restaurant_id');
    }

    public function setting(): HasOne
    {
        return $this->hasOne(RestaurantSetting::class, 'restaurant_id');
    }
}
