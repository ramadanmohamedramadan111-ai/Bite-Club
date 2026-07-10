<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

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
        'total_orders_count',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'approved_by' => 'integer',
            'approved_at' => 'datetime',
            'average_rating' => 'decimal:2',
            'total_orders_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RestaurantCategory::class, 'category_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function settings(): HasOne
    {
        return $this->hasOne(RestaurantSetting::class);
    }
}
