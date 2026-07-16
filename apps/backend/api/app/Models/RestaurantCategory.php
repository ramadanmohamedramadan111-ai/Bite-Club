<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantCategory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'image_url',
    ];

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class, 'category_id');
    }
}
