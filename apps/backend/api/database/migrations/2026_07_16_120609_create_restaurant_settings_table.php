<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('restaurant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->unique()->constrained('restaurants')->cascadeOnDelete()->comment('Foreign key reference to restaurants table.');

            $table->boolean('is_open')->default(true)->comment('Indicates whether the restaurant is currently open for business.');
            $table->boolean('accept_orders')->default(true)->comment('Indicates whether the restaurant is accepting new orders.');

            $table->boolean('delivery_enabled')->default(true)->comment('Indicates whether the restaurant offers delivery.');
            $table->boolean('pickup_enabled')->default(true)->comment('Indicates whether the restaurant offers pickup.');

            $table->decimal('latitude', 10, 8)->comment('Geographical latitude of the restaurant.');
            $table->decimal('longitude', 11, 8)->comment('Geographical longitude of the restaurant.');

            $table->decimal('delivery_radius', 5, 2)->default(10.00)->comment('Maximum delivery radius in kilometers.');
            $table->decimal('delivery_fee_per_km', 8, 2)->default(5.00)->comment('Delivery fee charged per kilometer.');

            $table->decimal('deposit_threshold', 8, 2)->default(250.00)->comment('Order amount threshold above which a deposit is required.');
            $table->decimal('deposit_percentage', 5, 2)->default(50.00)->comment('Percentage of the order amount required as a deposit if threshold is met.');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_settings');
    }
};
