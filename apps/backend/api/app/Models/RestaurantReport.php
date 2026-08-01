<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'report_date',
        'report_en',
        'report_ar',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date:Y-m-d',
            'report_en' => 'array',
            'report_ar' => 'array',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
