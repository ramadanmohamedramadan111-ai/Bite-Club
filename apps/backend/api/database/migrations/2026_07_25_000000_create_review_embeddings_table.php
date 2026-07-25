<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('restaurant_reviews')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->json('embedding');
            $table->timestamps();

            $table->unique('review_id');
            $table->index('restaurant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_embeddings');
    }
};
