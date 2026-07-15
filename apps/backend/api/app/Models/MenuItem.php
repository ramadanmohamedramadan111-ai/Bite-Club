<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class MenuItem extends Model
{
    use HasFactory;

    protected $table = 'items';

    protected $fillable = [
        'menu_category_id',
        'title',
        'description',
        'image_url',
        'price',
        'availability',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'availability' => MenuItemAvailabilityEnum::class,
        ];
    }

    public function menuCategory(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }
}
