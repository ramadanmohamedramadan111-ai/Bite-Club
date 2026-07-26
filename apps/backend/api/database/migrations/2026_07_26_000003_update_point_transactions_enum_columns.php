<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->enum('type', PointTransactionTypeEnum::values())->change();
            $table->enum('source', PointTransactionSourceEnum::values())->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->enum('type', ['earn', 'redeem'])->change();
            $table->enum('source', ['referral', 'weekly_streak', 'leaderboard', 'redemption'])->change();
        });
    }
};
