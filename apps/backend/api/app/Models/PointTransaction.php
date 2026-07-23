<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;

class PointTransaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'points',
        'type',
        'source',
        'reference_id',
        'reference_type',
    ];

    protected $casts = [
        'points' => 'integer',
        'type'   => PointTransactionTypeEnum::class,
        'source' => PointTransactionSourceEnum::class,
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
