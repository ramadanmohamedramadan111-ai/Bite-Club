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
        Schema::table('groups', function (Blueprint $table) {
            $table->boolean('allow_guests_for_orders')->default(false)->after('allow_join_by_link');
        });

        Schema::table('group_orders', function (Blueprint $table) {
            $table->boolean('allow_guests')->default(false)->after('order_id');
        });

        Schema::create('group_order_items_guest', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_order_id')->constrained('group_orders')->cascadeOnDelete();
            $table->unsignedBigInteger('user_id');
            $table->string('user_name');
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
        Schema::dropIfExists('group_order_items_guest');

        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropColumn('allow_guests');
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->dropColumn('allow_guests_for_orders');
        });
    }
};
