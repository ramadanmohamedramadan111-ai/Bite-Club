<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;

class OrderPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_type',
        'payment_method',
        'amount',
        'status',
        'transaction_id',
    ];

    protected $casts = [
        'payment_type' => PaymentTypeEnum::class,
        'payment_method' => PaymentMethodEnum::class,
        'status' => PaymentStatusEnum::class,
        'amount' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
