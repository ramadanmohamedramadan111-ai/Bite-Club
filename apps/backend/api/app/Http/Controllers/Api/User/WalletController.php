<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Services\Application\Loyalty\WalletApplicationService;
use App\Services\Application\Loyalty\ReferralApplicationService;
use App\Services\Application\Loyalty\WeeklyStreakApplicationService;
use App\Http\Resources\Loyalty\WalletResource;
use App\Http\Resources\Loyalty\PointTransactionResource;
use App\Http\Resources\Loyalty\ReferralResource;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class WalletController extends Controller
{
    public function __construct(
        private readonly WalletApplicationService $walletApplicationService,
        private readonly ReferralApplicationService $referralApplicationService,
        private readonly WeeklyStreakApplicationService $weeklyStreakApplicationService
    ) {}

    public function show(Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $userId],
                ['balance' => 0]
            );

            return $this->successResponse(
                trans('loyalty.wallet_fetch_success') ?? 'Wallet retrieved successfully.',
                new WalletResource($wallet)
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch wallet: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('loyalty.wallet_fetch_failed') ?? 'Failed to retrieve wallet.');
        }
    }

    public function transactions(Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            $perPage = $request->query('per_page', 15);

            $transactions = $this->walletApplicationService->getTransactions($userId, (int) $perPage);

            return $this->successResponse(
                trans('loyalty.transactions_fetch_success') ?? 'Wallet transactions retrieved successfully.',
                [
                    'items' => PointTransactionResource::collection($transactions->items()),
                    'meta'  => [
                        'current_page' => $transactions->currentPage(),
                        'per_page'     => $transactions->perPage(),
                        'total'        => $transactions->total(),
                        'last_page'    => $transactions->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch wallet transactions: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('loyalty.transactions_fetch_failed') ?? 'Failed to retrieve wallet transactions.');
        }
    }

    public function referrals(Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            $perPage = $request->query('per_page', 15);

            $referrals = $this->referralApplicationService->getReferrals($userId, (int) $perPage);

            return $this->successResponse(
                trans('loyalty.referrals_fetch_success') ?? 'Referrals retrieved successfully.',
                [
                    'items' => ReferralResource::collection($referrals->items()),
                    'meta'  => [
                        'current_page' => $referrals->currentPage(),
                        'per_page'     => $referrals->perPage(),
                        'total'        => $referrals->total(),
                        'last_page'    => $referrals->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch referrals: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('loyalty.referrals_fetch_failed') ?? 'Failed to retrieve referrals.');
        }
    }

    public function streak(Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();

            $streakData = $this->weeklyStreakApplicationService->getStreakProgress($userId);

            return $this->successResponse(
                trans('loyalty.streak_fetch_success') ?? 'Weekly streak retrieved successfully.',
                $streakData
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch weekly streak: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('loyalty.streak_fetch_failed') ?? 'Failed to retrieve weekly streak.');
        }
    }
}
