<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use App\Enums\Loyalty\ReferralStatusEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('balance')->default(0);
            $table->timestamps();
        });

        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->integer('points');
            $table->enum('type', PointTransactionTypeEnum::values());
            $table->enum('source', PointTransactionSourceEnum::values());
            $table->nullableMorphs('reference');
            $table->timestamps();
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->enum('status', ReferralStatusEnum::values())->default(ReferralStatusEnum::PENDING->value);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('user_weekly_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('completed_orders_count')->default(0);
            $table->date('week_start_date');
            $table->boolean('reward_granted')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'week_start_date']);
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('badge_type');
            $table->date('week_start_date');
            $table->timestamps();

            $table->unique(['user_id', 'badge_type', 'week_start_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('user_weekly_streaks');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('wallets');
    }
};
