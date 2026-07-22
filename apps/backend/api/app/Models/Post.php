<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\Social\PostStatusEnum;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'order_id',
        'caption',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'likes_count',
        'copy_count',
        'published_at',
        'expires_at',
    ];

    protected $casts = [
        'status'       => PostStatusEnum::class,
        'reviewed_at'  => 'datetime',
        'published_at' => 'datetime',
        'expires_at'   => 'datetime',
        'likes_count'  => 'integer',
        'copy_count'   => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'reviewed_by');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PostImage::class)->orderBy('position');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function copies(): HasMany
    {
        return $this->hasMany(OrderCopy::class);
    }

    public function isApproved(): bool
    {
        return $this->status === PostStatusEnum::APPROVED;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isActiveFeedPost(): bool
    {
        return $this->isApproved() && !$this->isExpired();
    }
}
