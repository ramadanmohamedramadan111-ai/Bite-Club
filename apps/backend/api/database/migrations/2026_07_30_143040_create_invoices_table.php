<?php

use \App\Enums\Invoice\InvoiceStatusEnum;
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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->decimal('amount', 10, 2)->comment('إجمالي قيمة الفاتورة');
            $table->date('billing_start_date')->comment('للعرض في الـ UI');
            $table->date('billing_end_date')->comment('للعرض في الـ UI');
            $table->date('due_date')->comment('الديدلاين اللي بعده المطعم بيتوقف');
            $table->string('status', 50)->default(InvoiceStatusEnum::UNPAID->value)->comment('ENUM: unpaid, paid, overdue');
            $table->string('payment_gateway_ref', 255)->nullable()->comment('رقم عملية الدفع كمرجع');
            $table->timestamp('paid_at')->nullable()->comment('وقت الدفع الفعلي من البوابة');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
