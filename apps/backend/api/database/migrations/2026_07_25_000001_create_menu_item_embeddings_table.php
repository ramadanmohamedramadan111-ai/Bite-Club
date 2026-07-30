<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('menu_item_embeddings')) {
            Schema::create('menu_item_embeddings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('item_id')->unique()->constrained('items')->cascadeOnDelete();
                $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
                $table->json('embedding');
                $table->timestamps();

                $table->index('restaurant_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_item_embeddings');
    }
};
