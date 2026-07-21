<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Social\OrderCopyStatusEnum;

class OrderCopy extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'original_order_id',
        'copied_order_id',
        'copied_by_user_id',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'status'       => OrderCopyStatusEnum::class,
        'completed_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function originalOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'original_order_id');
    }

    public function copiedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'copied_order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'copied_by_user_id');
    }
}
