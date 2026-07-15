<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->string('title', 100);
            $table->string('icon_name', 100);
            $table->string('short_description', 100);
            $table->string('visibility')->default(MenuCategoryVisibilityEnum::VISIBLE->value);
            $table->timestamps();

            // Adding unique constraint
            $table->unique(['restaurant_id', 'title'], 'menu_categories_restaurant_title_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_categories');
    }
};
