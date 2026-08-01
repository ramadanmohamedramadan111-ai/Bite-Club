<?php

use \App\Enums\Invoice\PlatformDueStatusEnum;
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
        Schema::create('platform_dues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->decimal('commission_rate', 8, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->decimal('service_fee', 10, 2);
            $table->decimal('total_due', 10, 2);
            $table->string('invoice_status', 50)->default(PlatformDueStatusEnum::UNINVOICED->value)->comment('ENUM: uninvoiced, invoiced');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_dues');
    }
};
