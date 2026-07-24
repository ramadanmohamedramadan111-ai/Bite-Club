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
        Schema::create('group_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_order_id')->constrained('group_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('item_id')->constrained('items');
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_order_items');
    }
};
