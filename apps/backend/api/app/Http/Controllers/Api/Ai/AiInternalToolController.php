<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AiInternalToolController extends Controller
{
    use ApiResponseTrait;

    public function menu(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $categories = MenuCategory::query()
            ->where('restaurant_id', $restaurant->id)
            ->with(['items' => fn ($query) => $query->where('availability', 'available')->orderBy('title')])
            ->orderBy('title')
            ->get()
            ->map(fn (MenuCategory $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'visibility' => $category->visibility?->value ?? $category->visibility,
                'items' => $category->items->map(fn ($item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'description' => $item->description,
                    'price' => (float) $item->price,
                    'availability' => $item->availability?->value ?? $item->availability,
                ])->values(),
            ])->values();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'categories' => $categories,
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $today = now()->toDateString();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'orders' => [
                'total' => Order::where('restaurant_id', $restaurant->id)->count(),
                'today' => Order::where('restaurant_id', $restaurant->id)->whereDate('created_at', $today)->count(),
                'live' => Order::where('restaurant_id', $restaurant->id)
                    ->whereIn('status', ['awaiting_payment', 'pending', 'preparing', 'ready', 'out_for_delivery'])
                    ->count(),
            ],
            'revenue' => [
                'total' => (float) Order::where('restaurant_id', $restaurant->id)->sum('total'),
                'today' => (float) Order::where('restaurant_id', $restaurant->id)
                    ->whereDate('created_at', $today)
                    ->sum('total'),
            ],
            'reviews' => [
                'average_rating' => (float) $restaurant->average_rating,
                'count' => (int) $restaurant->reviews_count,
            ],
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $orders = Order::query()
            ->where('restaurant_id', $restaurant->id)
            ->with('items')
            ->latest()
            ->limit($this->limit($request))
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'status' => $order->status?->value ?? $order->status,
                'order_type' => $order->order_type?->value ?? $order->order_type,
                'subtotal' => (float) $order->subtotal,
                'delivery_fee' => (float) $order->delivery_fee,
                'service_fee' => (float) $order->service_fee,
                'total' => (float) $order->total,
                'created_at' => $order->created_at?->toIso8601String(),
                'items' => $order->items->map(fn ($item) => [
                    'item_id' => $item->item_id,
                    'item_name' => $item->item_name,
                    'quantity' => (int) $item->quantity,
                    'price' => (float) $item->price,
                ])->values(),
            ])->values();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'orders' => $orders,
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $from = $request->input('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->subDays(30)->startOfDay();
        $to = $request->input('to') ? Carbon::parse($request->input('to'))->endOfDay() : now()->endOfDay();

        $daily = Order::query()
            ->where('restaurant_id', $restaurant->id)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders_count, COALESCE(SUM(total), 0) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_revenue' => (float) $daily->sum('revenue'),
            'total_orders' => (int) $daily->sum('orders_count'),
            'daily' => $daily,
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $customers = Order::query()
            ->where('restaurant_id', $restaurant->id)
            ->selectRaw('user_id, COUNT(*) as orders_count, COALESCE(SUM(total), 0) as total_spent, MAX(created_at) as last_order_at')
            ->groupBy('user_id')
            ->orderByDesc('orders_count')
            ->limit($this->limit($request))
            ->get();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'customers_count' => $customers->count(),
            'customers' => $customers,
        ]);
    }

    public function restaurant(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $restaurant->loadMissing(['category', 'setting', 'openingHours']);

        return response()->json([
            'id' => $restaurant->id,
            'name' => $restaurant->name,
            'category' => $restaurant->category?->name,
            'description' => $restaurant->description,
            'address' => $restaurant->address,
            'status' => $restaurant->status?->value ?? $restaurant->status,
            'average_rating' => (float) $restaurant->average_rating,
            'reviews_count' => (int) $restaurant->reviews_count,
            'total_orders_count' => (int) $restaurant->total_orders_count,
            'is_open_now' => $restaurant->isOpenNow(),
            'opening_hours' => $restaurant->openingHours,
            'settings' => $restaurant->setting,
        ]);
    }

    public function reviewsSummary(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $ratings = RestaurantReview::query()
            ->where('restaurant_id', $restaurant->id)
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();

        $latest = RestaurantReview::query()
            ->where('restaurant_id', $restaurant->id)
            ->latest()
            ->limit($this->limit($request))
            ->get(['id', 'user_id', 'rating', 'comment', 'created_at']);

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'average_rating' => (float) $restaurant->average_rating,
            'reviews_count' => (int) $restaurant->reviews_count,
            'rating_breakdown' => $ratings,
            'latest_reviews' => $latest,
        ]);
    }

    public function reviews(Request $request): JsonResponse
    {
        $reviewIds = $request->input('review_ids', []);
        
        $reviews = RestaurantReview::query()
            ->whereIn('id', $reviewIds)
            ->get(['id', 'restaurant_id', 'rating', 'comment'])
            ->map(fn($r) => [
                'id' => $r->id,
                'restaurant_id' => $r->restaurant_id,
                'rating' => (float) $r->rating,
                'comment' => $r->comment,
            ]);

        return response()->json([
            'reviews' => $reviews,
        ]);
    }

    public function userHistory(Request $request): JsonResponse
    {
        $restaurant = $this->validatedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $userId = $request->input('user_id');
        if (!$userId) {
            return response()->json([
                'restaurant_id' => $restaurant->id,
                'user_id' => null,
                'total_orders' => 0,
                'past_items' => [],
            ]);
        }

        $orders = Order::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('user_id', $userId)
            ->with('items')
            ->latest()
            ->limit(10)
            ->get();

        $pastItems = $orders->flatMap(fn (Order $order) => $order->items->map(fn ($item) => [
            'item_id' => $item->item_id,
            'item_name' => $item->item_name,
            'quantity' => (int) $item->quantity,
            'price' => (float) $item->price,
            'ordered_at' => $order->created_at?->toIso8601String(),
        ]))->values();

        return response()->json([
            'restaurant_id' => $restaurant->id,
            'user_id' => (int) $userId,
            'total_orders' => $orders->count(),
            'past_items' => $pastItems,
        ]);
    }


    private function validatedRestaurant(Request $request): Restaurant|JsonResponse
    {
        try {
            $validated = $request->validate([
                'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(null, $exception->errors(), 422);
        }

        return Restaurant::findOrFail($validated['restaurant_id']);
    }

    private function limit(Request $request): int
    {
        return min(max((int) $request->input('limit', 20), 1), 100);
    }

    public function filteredRestaurants(Request $request): JsonResponse
    {
        $lat = $request->input('latitude');
        $lng = $request->input('longitude');

        $restaurants = Restaurant::query()
            ->where('status', 'active')
            ->with(['setting', 'openingHours', 'category'])
            ->get()
            ->filter(function ($restaurant) {
                if (!$restaurant->setting || !$restaurant->setting->is_open || !$restaurant->setting->accept_orders) {
                    return false;
                }
                return $restaurant->isOpenNow();
            })
            ->map(function ($restaurant) use ($lat, $lng) {
                $distance = null;
                if ($lat !== null && $lng !== null && $restaurant->setting->latitude && $restaurant->setting->longitude) {
                    $distance = $this->calculateDistance($lat, $lng, $restaurant->setting->latitude, $restaurant->setting->longitude);
                }

                $now = now();
                $currentDay = $now->dayOfWeek;
                $todayRecord = $restaurant->openingHours->firstWhere('day_of_week', $currentDay);
                
                return [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'category' => $restaurant->category?->name,
                    'distance_km' => $distance !== null ? round($distance, 2) : null,
                    'is_open_now' => true,
                    'closing_time' => $todayRecord ? $todayRecord->closes_at : null,
                ];
            });

        if ($lat !== null && $lng !== null) {
            $restaurants = $restaurants->sortBy('distance_km');
        }

        $restaurants = $restaurants->values();

        return response()->json([
            'restaurants' => $restaurants,
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        if ($dist > 1) {
            $dist = 1; // avoid precision issues causing NaN
        }
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        return $miles * 1.609344;
    }
}
