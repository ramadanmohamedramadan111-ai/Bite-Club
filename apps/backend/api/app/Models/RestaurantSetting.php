<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantSetting extends Model
{
    use HasFactory;

    const CREATED_AT = null;

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'restaurant_id',
        'commission_rate',
        'deposit_threshold',
        'deposit_percentage',
        'service_fee_amount',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'restaurant_id' => 'integer',
            'commission_rate' => 'decimal:2',
            'deposit_threshold' => 'decimal:2',
            'deposit_percentage' => 'decimal:2',
            'service_fee_amount' => 'decimal:2',
            'updated_at' => 'datetime',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id');
    }
}
