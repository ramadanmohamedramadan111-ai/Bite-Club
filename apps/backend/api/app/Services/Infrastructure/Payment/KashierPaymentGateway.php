<?php

namespace App\Services\Infrastructure\Payment;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KashierPaymentGateway implements PaymentGatewayInterface
{
    public function createPaymentSession(Order $order, float $amount): ?string
    {
        $baseUrl = config('payment.kashier.base_url');
        $apiKey = config('payment.kashier.api_key');
        $merchantId = config('payment.kashier.merchant_id');
        $webhookSecret = config('payment.kashier.webhook_secret');
        $currency = config('payment.kashier.currency', 'EGP');

        if (!$apiKey || !$merchantId || !$webhookSecret) {
            Log::error('Kashier configuration missing');
            return null;
        }

        try {

            // According to Kashier v3 docs
            $response = Http::withHeaders([
                'Authorization' => $webhookSecret,
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$baseUrl}/v3/payment/sessions", [
                'merchantId' => $merchantId,
                'amount' => (string) $amount,
                'currency' => $currency,
                'order' => (string) $order->id,
                'paymentType' => 'credit',
                'type' => 'one-time',
                'allowedMethods' => 'card,wallet',
                'merchantRedirect' => env('FRONTEND_URL', 'https://example.com') . '/payment-callback',
                'expireAt' => now()->addHours(24)->toIso8601ZuluString(),
                'maxFailureAttempts' => 3,
                'display' => app()->getLocale() === 'ar' ? 'ar' : 'en',
                'customer' => [
                    'email' => $order->user->email ?? 'customer@example.com',
                    'reference' => (string) ($order->user_id ?? uniqid()),
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['sessionUrl'] ?? ($data['response']['sessionUrl'] ?? null);
            }

            Log::error('Kashier Payment Session Error: ' . $response->body());

            return null;
        } catch (\Exception $e) {
            Log::error('Kashier Exception: ' . $e->getMessage());

            return null;
        }
    }
}
