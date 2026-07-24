<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_order_id',
        'user_id',
        'item_id',
        'item_name',
        'quantity',
        'unit_price',
        'notes',
    ];

    public function groupOrder()
    {
        return $this->belongsTo(GroupOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'item_id');
    }
}
