<?php

namespace App\Services\Domain\Admin\Social;

use App\Models\Post;
use App\Models\Restaurant;
use Illuminate\Support\Facades\DB;

class LeaderboardDashboardDomainService
{
    public function getDashboardStats(): array
    {
        $weekStart = now()->startOfWeek(\Carbon\Carbon::TUESDAY)->startOfDay();
        $weekEnd   = $weekStart->copy()->addDays(6)->endOfDay();

        $summary = [
            'total_posts'        => Post::whereBetween('created_at', [$weekStart, $weekEnd])->count(),
            'total_copies'       => (int) Post::whereBetween('created_at', [$weekStart, $weekEnd])->sum('copy_count'),
            'active_users'       => Post::whereBetween('created_at', [$weekStart, $weekEnd])->distinct('user_id')->count('user_id'),
            'active_restaurants' => Post::whereBetween('created_at', [$weekStart, $weekEnd])->distinct('restaurant_id')->count('restaurant_id'),
        ];

        $topPosts = Post::with(['user', 'restaurant', 'images'])
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->orderBy('copy_count', 'desc')
            ->take(10)
            ->get();

        $topRestaurants = Restaurant::query()
            ->join('posts', 'restaurants.id', '=', 'posts.restaurant_id')
            ->whereNull('posts.deleted_at')
            ->whereBetween('posts.created_at', [$weekStart, $weekEnd])
            ->select('restaurants.id', 'restaurants.name')
            ->selectRaw('COUNT(posts.id) as posts_count')
            ->selectRaw('COALESCE(SUM(posts.copy_count), 0) as total_copies')
            ->groupBy('restaurants.id', 'restaurants.name')
            ->orderBy('total_copies', 'desc')
            ->orderBy('posts_count', 'desc')
            ->take(10)
            ->get();

        return [
            'summary'         => $summary,
            'top_posts'       => $topPosts,
            'top_restaurants' => $topRestaurants,
        ];
    }
}
