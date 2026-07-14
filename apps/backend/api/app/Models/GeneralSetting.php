<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralSetting extends Model
{
    use HasFactory;

    const CREATED_AT = null;

    const UPDATED_AT = 'updated_at';

    protected $table = 'general_settings';

    protected $fillable = [
        'commission_rate',
        'service_fee_amount',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate'    => 'decimal:2',
            'service_fee_amount' => 'decimal:2',
            'updated_at'         => 'datetime',
        ];
    }
}
