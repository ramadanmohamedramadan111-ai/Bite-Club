<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Invoice\PlatformDueStatusEnum;

class PlatformDue extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'restaurant_id',
        'invoice_id',
        'commission_rate',
        'commission_amount',
        'service_fee',
        'total_due',
        'invoice_status',
    ];

    protected $casts = [
        'commission_rate' => 'float',
        'commission_amount' => 'float',
        'service_fee' => 'float',
        'total_due' => 'float',
        'invoice_status' => PlatformDueStatusEnum::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
