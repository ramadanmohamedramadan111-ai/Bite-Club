<?php

namespace App\Models;

use App\Enums\GroupOrder\GroupOrderStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'host_id',
        'restaurant_id',
        'order_id',
        'status',
    ];

    protected $casts = [
        'status' => GroupOrderStatusEnum::class,
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->hasMany(GroupOrderItem::class);
    }
}
