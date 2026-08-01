<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\Invoice\InvoiceStatusEnum;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'amount',
        'billing_start_date',
        'billing_end_date',
        'due_date',
        'status',
        'payment_gateway_ref',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'billing_start_date' => 'date',
        'billing_end_date' => 'date',
        'due_date' => 'date',
        'status' => InvoiceStatusEnum::class,
        'paid_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function platformDues(): HasMany
    {
        return $this->hasMany(PlatformDue::class);
    }
}
