<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupOrderItemGuest extends Model
{
    use HasFactory;

    protected $table = 'group_order_items_guest';

    protected $fillable = [
        'group_order_id',
        'user_id',
        'user_name',
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

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'item_id');
    }
}
