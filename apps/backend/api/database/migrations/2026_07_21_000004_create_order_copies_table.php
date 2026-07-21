<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\Social\OrderCopyStatusEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('original_order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('copied_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('copied_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', OrderCopyStatusEnum::values())->default(OrderCopyStatusEnum::PENDING->value);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['post_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_copies');
    }
};
