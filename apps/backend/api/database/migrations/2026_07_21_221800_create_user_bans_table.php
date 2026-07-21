<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_bans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('reason');
            $table->foreignId('banned_by_admin_id')->constrained('admins')->cascadeOnDelete();
            $table->timestamp('banned_at');
            $table->foreignId('lifted_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('lifted_reason')->nullable();
            $table->timestamp('lifted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_bans');
    }
};
