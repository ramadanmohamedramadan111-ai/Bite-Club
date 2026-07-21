<?php

namespace App\Services\Infrastructure\Payment;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KashierPaymentGateway implements PaymentGatewayInterface
{
    public function createPaymentSession(Order $order, float $amount): ?string
    {
        $settings = $order->restaurant->setting ?? null;

        if (!$settings || !$settings->kashier_api_key || !$settings->kashier_merchant_id || !$settings->kashier_webhook_secret) {
            Log::error('Kashier configuration missing for restaurant: ' . $order->restaurant_id);
            return null;
        }

        $baseUrl = config('payment.kashier.base_url');
        $apiKey = $settings->kashier_api_key;
        $merchantId = $settings->kashier_merchant_id;
        $webhookSecret = $settings->kashier_webhook_secret;
        $currency = config('payment.kashier.currency', 'EGP');

        try {

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
                'serverWebhook' => rtrim(config('app.url'), '/') . '/api/user/webhooks/kashier',
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

    public function validateWebhookSignature(array $payload, ?string $signature, string $paymentApiKey): bool
    {
        if (!$signature) {
            return false;
        }

        $dataObj = $payload['data'] ?? [];

        if (!isset($dataObj['signatureKeys']) || !is_array($dataObj['signatureKeys'])) {
            return false;
        }

        $signatureKeys = $dataObj['signatureKeys'];
        sort($signatureKeys);

        $data = [];
        foreach ($signatureKeys as $key) {
            $data[$key] = $dataObj[$key] ?? '';
        }

        $queryString = http_build_query($data, "", '&', PHP_QUERY_RFC3986);
        $hashedSignature = hash_hmac('sha256', $queryString, $paymentApiKey, false);

        return hash_equals($hashedSignature, $signature);
    }
}
