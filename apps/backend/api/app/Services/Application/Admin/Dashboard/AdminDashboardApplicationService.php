<?php

namespace App\Services\Application\Admin\Dashboard;

use App\Models\GeneralSetting;
use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Post;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Auth\UserStatusEnum;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Support\Carbon;

class AdminDashboardApplicationService
{
    public function getDashboardSummary(string $period): array
    {
        $generalSetting = GeneralSetting::first();
        $commissionRate = $generalSetting ? (float) $generalSetting->commission_rate : 10.0;

        $totalOrdersQuery = Order::query();
        $this->applyPeriodFilter($totalOrdersQuery, $period);
        $totalOrders = $totalOrdersQuery->count();

        $revenueQuery = Order::query()->where('status', OrderStatusEnum::COMPLETED->value);
        $this->applyPeriodFilter($revenueQuery, $period);
        $financials = $revenueQuery->selectRaw('SUM(subtotal) as total_subtotal, SUM(service_fee) as total_service_fee')->first();
        
        $totalRevenue = 0.0;
        if ($financials) {
            $totalRevenue = (($financials->total_subtotal ?? 0.0) * $commissionRate / 100) + ($financials->total_service_fee ?? 0.0);
        }

        $newUsersQuery = User::query()->where('status', UserStatusEnum::ACTIVE->value);
        $this->applyPeriodFilter($newUsersQuery, $period);
        $newUsers = $newUsersQuery->count();

        $pendingRestaurants = Restaurant::query()->where('status', RestaurantStatusEnum::PENDING_APPROVAL->value)->count();

        $recentOrdersRaw = Order::query()
            ->with([
                'restaurant:id,name',
                'user:id,first_name,last_name'
            ])
            ->select(['id', 'restaurant_id', 'user_id', 'subtotal', 'total', 'status', 'created_at'])
            ->latest()
            ->limit(10)
            ->get();

        $recentOrders = $recentOrdersRaw->map(function ($order) use ($commissionRate) {
            return [
                'id' => $order->id,
                'restaurant_name' => $order->restaurant?->name,
                'host_user' => $order->user?->full_name,
                'total_amount' => (float) $order->total,
                'commission_amount' => (float) (($order->subtotal * $commissionRate) / 100),
                'status' => $order->status instanceof \UnitEnum ? $order->status->value : $order->status,
                'created_at' => $order->created_at?->toIso8601String(),
            ];
        })->toArray();

        $newUsersActivity = User::query()
            ->select(['id', 'first_name', 'last_name', 'created_at'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($u) => [
                'type' => 'user_registered',
                'title' => trans('dashboard.activity.user_registered'),
                'description' => trans('dashboard.activity.user_registered_desc', ['name' => $u->full_name]),
                'created_at' => $u->created_at,
            ]);

        $newRestaurantsActivity = Restaurant::query()
            ->select(['id', 'name', 'created_at'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'type' => 'restaurant_created',
                'title' => trans('dashboard.activity.restaurant_created'),
                'description' => trans('dashboard.activity.restaurant_created_desc', ['name' => $r->name]),
                'created_at' => $r->created_at,
            ]);

        $approvedRestaurantsActivity = Restaurant::query()
            ->where('status', RestaurantStatusEnum::ACTIVE->value)
            ->whereNotNull('approved_at')
            ->select(['id', 'name', 'approved_at'])
            ->orderBy('approved_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'type' => 'restaurant_approved',
                'title' => trans('dashboard.activity.restaurant_approved'),
                'description' => trans('dashboard.activity.restaurant_approved_desc', ['name' => $r->name]),
                'created_at' => $r->approved_at,
            ]);

        $rejectedRestaurantsActivity = Restaurant::query()
            ->where('status', RestaurantStatusEnum::REJECTED->value)
            ->select(['id', 'name', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'type' => 'restaurant_rejected',
                'title' => trans('dashboard.activity.restaurant_rejected'),
                'description' => trans('dashboard.activity.restaurant_rejected_desc', ['name' => $r->name]),
                'created_at' => $r->updated_at,
            ]);

        $newOrdersActivity = Order::query()
            ->with('user:id,first_name,last_name')
            ->select(['id', 'user_id', 'created_at'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($o) => [
                'type' => 'order_created',
                'title' => trans('dashboard.activity.order_created'),
                'description' => trans('dashboard.activity.order_created_desc', ['name' => $o->user?->full_name]),
                'created_at' => $o->created_at,
            ]);

        $cancelledOrdersActivity = Order::query()
            ->where('status', OrderStatusEnum::CANCELLED->value)
            ->select(['id', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($o) => [
                'type' => 'order_cancelled',
                'title' => trans('dashboard.activity.order_cancelled'),
                'description' => trans('dashboard.activity.order_cancelled_desc', ['id' => $o->id]),
                'created_at' => $o->updated_at,
            ]);

        $newPostsActivity = Post::query()
            ->with('user:id,first_name,last_name')
            ->select(['id', 'user_id', 'created_at'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'type' => 'post_created',
                'title' => trans('dashboard.activity.post_created'),
                'description' => trans('dashboard.activity.post_created_desc', ['name' => $p->user?->full_name]),
                'created_at' => $p->created_at,
            ]);

        $activities = collect()
            ->concat($newUsersActivity)
            ->concat($newRestaurantsActivity)
            ->concat($approvedRestaurantsActivity)
            ->concat($rejectedRestaurantsActivity)
            ->concat($newOrdersActivity)
            ->concat($cancelledOrdersActivity)
            ->concat($newPostsActivity)
            ->sortByDesc(fn($act) => $act['created_at'] instanceof Carbon ? $act['created_at']->timestamp : strtotime($act['created_at']))
            ->take(10)
            ->map(function ($act) {
                $act['created_at'] = $act['created_at'] instanceof Carbon ? $act['created_at']->toIso8601String() : Carbon::parse($act['created_at'])->toIso8601String();
                return $act;
            })
            ->values()
            ->toArray();

        return [
            'stats' => [
                'total_revenue'       => round($totalRevenue, 2),
                'total_orders'        => $totalOrders,
                'new_users'           => $newUsers,
                'pending_restaurants' => $pendingRestaurants,
            ],
            'recent_orders'   => $recentOrders,
            'recent_activity' => $activities,
        ];
    }

    private function applyPeriodFilter($query, string $period)
    {
        switch ($period) {
            case 'today':
                return $query->where('created_at', '>=', Carbon::today());
            case 'week':
                return $query->where('created_at', '>=', Carbon::now()->startOfWeek());
            case 'month':
                return $query->where('created_at', '>=', Carbon::now()->startOfMonth());
            case 'year':
                return $query->where('created_at', '>=', Carbon::now()->startOfYear());
            case 'all':
            default:
                return $query;
        }
    }
}
