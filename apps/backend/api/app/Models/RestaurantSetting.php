<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantSetting extends Model
{
    use HasFactory;

    const UPDATED_AT = 'updated_at';

    protected $table = 'restaurant_settings';

    protected $fillable = [
        'restaurant_id',
        'is_open',
        'accept_orders',
        'delivery_enabled',
        'pickup_enabled',
        'latitude',
        'longitude',
        'delivery_radius',
        'delivery_fee_per_km',
        'deposit_threshold',
        'deposit_percentage',
        'kashier_api_key',
        'kashier_merchant_id',
        'kashier_webhook_secret',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'restaurant_id'       => 'integer',
            'is_open'             => 'boolean',
            'accept_orders'       => 'boolean',
            'delivery_enabled'    => 'boolean',
            'pickup_enabled'      => 'boolean',
            'latitude'            => 'decimal:8',
            'longitude'           => 'decimal:8',
            'delivery_radius'     => 'decimal:2',
            'delivery_fee_per_km' => 'decimal:2',
            'deposit_threshold'   => 'decimal:2',
            'deposit_percentage'  => 'decimal:2',
            'created_at'          => 'datetime',
            'updated_at'          => 'datetime',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id');
    }
}
