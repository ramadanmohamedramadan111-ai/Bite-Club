<?php

namespace App\Services\Infrastructure\Payment;

use App\Models\Order;

interface PaymentGatewayInterface
{
    /**
     * Create a payment session and return the payment URL.
     */
    public function createPaymentSession(Order $order, float $amount): ?string;

    /**
     * Validate the webhook signature from the payment gateway.
     */
    public function validateWebhookSignature(array $payload, ?string $signature, string $paymentApiKey): bool;
}
