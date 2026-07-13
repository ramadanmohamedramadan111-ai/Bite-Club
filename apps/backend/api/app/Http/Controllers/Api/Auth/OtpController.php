<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\DTOs\Auth\SendOtpDto;
use App\DTOs\Auth\VerifyOtpDto;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\Application\Auth\OtpApplicationService;

class OtpController extends Controller
{
    public function __construct(
        private OtpApplicationService $otpApplicationService
    ) {}

    public function sendOtp(SendOtpRequest $request): JsonResponse
    {
        try {

            $dto = SendOtpDto::fromValidatedRequest($request);

            $this->otpApplicationService->sendOtp(
                $dto->getPhoneNumber()
            );

            return $this->successResponse(
                trans('auth.otp_sent')
            );
        } catch (Exception $e) {

            Log::error('Send OTP failed: ' . $e->getMessage(), [
                'phone_number' => $request->input('phone_number'),
            ]);

            return $this->errorResponse(
                $e->getMessage()
            );
        }
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        try {

            $dto = VerifyOtpDto::fromValidatedRequest($request);

            $result = $this->otpApplicationService->verifyOtp(
                $dto->getPhoneNumber(),
                $dto->getOtp()
            );

            return $this->successResponse(
                trans('auth.otp_verified'),
                $result
            );
        } catch (Exception $e) {

            Log::error('Verify OTP failed: ' . $e->getMessage(), [
                'phone_number' => $request->input('phone_number'),
            ]);

            return $this->errorResponse(
                $e->getMessage()
            );
        }
    }

    public function resendOtp(SendOtpRequest $request): JsonResponse
    {
        try {
            $dto = SendOtpDto::fromValidatedRequest($request);

            $this->otpApplicationService->resendOtp(
                $dto->getPhoneNumber()
            );

            return $this->successResponse(
                'OTP sent successfully.'
            );
        } catch (Exception $e) {
            Log::error('Resend OTP failed: ' . $e->getMessage(), [
                'phone_number' => $request->input('phone_number'),
            ]);

            return $this->errorResponse(
                $e->getMessage()
            );
        }
    }
}
