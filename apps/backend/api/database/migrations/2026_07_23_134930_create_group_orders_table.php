<?php

use App\Enums\GroupOrder\GroupOrderStatusEnum;
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
        Schema::create('group_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('host_id')->constrained('users');
            $table->foreignId('restaurant_id')->constrained('restaurants');
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('status')->default(GroupOrderStatusEnum::OPEN->value);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_orders');
    }
};
