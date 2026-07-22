<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\Infrastructure\Payment\PaymentGatewayInterface;
use App\Services\Domain\User\Order\OrderDomainService;

class KashierWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayInterface $paymentGateway,
        private readonly OrderDomainService $orderDomainService
    ) {}

    public function handle(Request $request)
    {
        $payload = $request->all();
        
        Log::info('Kashier Webhook Payload:', $payload);

        $kashierSignature = $request->header('x-kashier-signature');
        
        $data = $payload['data'] ?? [];
        $orderId = $data['merchantOrderId'] ?? null;
        
        $paymentApiKey = null;
        if ($orderId) {
            $paymentApiKey = $this->orderDomainService->getKashierApiKeyForOrder((int)$orderId);
        }

        if (!$paymentApiKey || !$this->paymentGateway->validateWebhookSignature($payload, $kashierSignature, $paymentApiKey)) {
            Log::error('Kashier Webhook: Invalid Signature or Missing API Key', ['signature' => $kashierSignature, 'orderId' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];

        if ($event === 'pay') {
            $status = $data['status'] ?? null;
            $transactionId = $data['transactionId'] ?? null;

            if ($orderId) {
                $this->orderDomainService->handlePaymentWebhook((string)$orderId, (string)$status, $transactionId);
            }
        }

        return response()->json(['message' => 'success'], 200);
    }
}
