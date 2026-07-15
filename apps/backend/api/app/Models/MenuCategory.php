<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class MenuCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'title',
        'icon_name',
        'short_description',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => MenuCategoryVisibilityEnum::class,
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'menu_category_id');
    }
}
