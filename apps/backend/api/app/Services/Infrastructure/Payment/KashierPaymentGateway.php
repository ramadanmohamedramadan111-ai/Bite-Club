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
                'merchantRedirect' => env('FRONTEND_URL', 'https://example.com') . '/orders',
                'expireAt' => now()->addMinutes((int) config('payment.kashier.session_timeout_minutes', 60))->toIso8601ZuluString(),
                'maxFailureAttempts' => 3,
                'display' => app()->getLocale() === 'ar' ? 'ar' : 'en',
                'serverWebhook' => rtrim(config('app.url'), '/') . '/backend/user/webhooks/kashier',
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

    public function createInvoicePaymentSession(\App\Models\Invoice $invoice): ?string
    {
        $baseUrl = config('payment.kashier.base_url');
        $apiKey = config('payment.kashier.api_key');
        $merchantId = config('payment.kashier.merchant_id');
        $webhookSecret = config('payment.kashier.webhook_secret');
        $currency = config('payment.kashier.currency', 'EGP');

        if (!$apiKey || !$merchantId || !$webhookSecret) {
            Log::error('Kashier configuration missing for platform (Admin).');
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $webhookSecret,
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$baseUrl}/v3/payment/sessions", [
                'merchantId' => $merchantId,
                'amount' => (string) $invoice->amount,
                'currency' => $currency,
                'order' => 'INV-' . $invoice->id . '-' . time(),
                'paymentType' => 'credit',
                'type' => 'one-time',
                'allowedMethods' => 'card,wallet',
                'merchantRedirect' => env('FRONTEND_URL', 'https://example.com') . '/restaurant/invoices',
                'expireAt' => now()->addMinutes((int) config('payment.kashier.session_timeout_minutes', 60))->toIso8601ZuluString(),
                'maxFailureAttempts' => 3,
                'display' => app()->getLocale() === 'ar' ? 'ar' : 'en',
                'serverWebhook' => rtrim(config('app.url'), '/') . '/backend/webhooks/kashier/invoices',
                'customer' => [
                    'email' => $invoice->restaurant->email ?? 'restaurant@example.com',
                    'reference' => 'REST-' . $invoice->restaurant_id,
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['sessionUrl'] ?? ($data['response']['sessionUrl'] ?? null);
            }

            Log::error('Kashier Invoice Payment Session Error: ' . $response->body());

            return null;
        } catch (\Exception $e) {
            Log::error('Kashier Invoice Exception: ' . $e->getMessage());
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
