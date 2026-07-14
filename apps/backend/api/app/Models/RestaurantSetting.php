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

    protected $table = 'restaurant_settings';

    protected $fillable = [
        'restaurant_id',
        'deposit_threshold',
        'deposit_percentage',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'restaurant_id'      => 'integer',
            'deposit_threshold'  => 'decimal:2',
            'deposit_percentage' => 'decimal:2',
            'updated_at'         => 'datetime',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id');
    }
}
