<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->unique()->constrained('restaurants')->cascadeOnDelete();
            $table->decimal('commission_rate', 8, 2)->default(10);
            $table->decimal('deposit_threshold', 8, 2)->default(250);
            $table->decimal('deposit_percentage', 8, 2)->default(50);
            $table->decimal('service_fee_amount', 8, 2)->default(3);
            $table->timestamp('updated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_settings');
    }
};
