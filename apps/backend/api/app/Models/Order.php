<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\Order\OrderStatusEnum;

use App\Enums\Order\OrderTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'order_type',
        'status',
        'subtotal',
        'delivery_fee',
        'service_fee',
        'total',
    ];

    protected $casts = [
        'order_type' => OrderTypeEnum::class,
        'status'     => OrderStatusEnum::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function platformDue(): HasOne
    {
        return $this->hasOne(PlatformDue::class);
    }
}
