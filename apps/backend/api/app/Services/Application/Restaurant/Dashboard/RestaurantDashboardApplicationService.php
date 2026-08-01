<?php

namespace App\Services\Application\Restaurant\Dashboard;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Enums\Order\OrderStatusEnum;
use App\DTOs\Restaurant\Dashboard\RestaurantDashboardDto;
use Illuminate\Support\Carbon;

class RestaurantDashboardApplicationService
{
    public function getDashboardData(RestaurantDashboardDto $dto): array
    {
        $restaurantId = $dto->getRestaurantId();
        $period = $dto->getPeriod();

        // 1. Calculate revenue and completed orders count within selected period
        $revenueQuery = Order::where('restaurant_id', $restaurantId)
            ->where('status', OrderStatusEnum::COMPLETED->value);
        $ordersQuery = Order::where('restaurant_id', $restaurantId)
            ->where('status', OrderStatusEnum::COMPLETED->value);

        $this->applyPeriodFilter($revenueQuery, $period);
        $this->applyPeriodFilter($ordersQuery, $period);

        $revenue = (float) $revenueQuery->sum('total');
        $ordersCount = (int) $ordersQuery->count();

        // 2. Pending orders count (not filtered by period)
        $pendingOrders = (int) Order::where('restaurant_id', $restaurantId)
            ->where('status', OrderStatusEnum::PENDING->value)
            ->count();

        // 3. Average rating
        $averageRating = (float) (RestaurantReview::where('restaurant_id', $restaurantId)->avg('rating') ?? 0.0);

        // 4. Latest 5 orders
        $latestOrders = Order::where('restaurant_id', $restaurantId)
            ->with(['items', 'payments', 'user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_type' => $order->order_type instanceof \UnitEnum ? $order->order_type->value : $order->order_type,
                    'status' => $order->status instanceof \UnitEnum ? $order->status->value : $order->status,
                    'customer' => [
                        'id' => $order->user->id ?? null,
                        'name' => $order->user ? trim($order->user->first_name . ' ' . $order->user->last_name) : null,
                        'phone_number' => $order->user->phone_number ?? null,
                    ],
                    'financials' => [
                        'subtotal' => (float) $order->subtotal,
                        'delivery_fee' => (float) $order->delivery_fee,
                        'service_fee' => (float) $order->service_fee,
                        'total' => (float) $order->total,
                    ],
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'item_id' => $item->item_id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'total_price' => (float) ($item->price * $item->quantity),
                            'notes' => $item->notes,
                        ];
                    })->toArray(),
                    'payments' => $order->payments->map(function ($payment) {
                        return [
                            'id' => $payment->id,
                            'payment_type' => $payment->payment_type,
                            'payment_method' => $payment->payment_method,
                            'amount' => (float) $payment->amount,
                            'status' => $payment->status,
                        ];
                    })->toArray(),
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    'time_ago' => $order->created_at->diffForHumans(),
                ];
            })->toArray();

        // 5. Recent 5 reviews
        $recentReviews = RestaurantReview::where('restaurant_id', $restaurantId)
            ->with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user' => [
                        'id' => $review->user->id ?? null,
                        'name' => $review->user ? trim($review->user->first_name . ' ' . $review->user->last_name) : null,
                        'profile_image' => $review->user->profile_image_url ?? null,
                    ],
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->toIso8601String(),
                ];
            })->toArray();

        // 6. Restaurant status
        $restaurant = Restaurant::with('setting')->findOrFail($restaurantId);
        $setting = $restaurant->setting;

        return [
            'summary' => [
                'revenue' => $revenue,
                'orders' => $ordersCount,
            ],
            'pending_orders' => $pendingOrders,
            'average_rating' => round($averageRating, 1),
            'latest_orders' => $latestOrders,
            'recent_reviews' => $recentReviews,
            'restaurant_status' => [
                'is_open' => $setting ? (bool) $setting->is_open : false,
                'accepting_orders' => $setting ? (bool) $setting->accept_orders : false,
            ],
        ];
    }

    private function applyPeriodFilter($query, string $period): void
    {
        switch ($period) {
            case 'today':
                $query->where('created_at', '>=', Carbon::today());
                break;
            case 'week':
                $query->where('created_at', '>=', Carbon::now()->startOfWeek());
                break;
            case 'month':
                $query->where('created_at', '>=', Carbon::now()->startOfMonth());
                break;
            case 'year':
                $query->where('created_at', '>=', Carbon::now()->startOfYear());
                break;
        }
    }
}
