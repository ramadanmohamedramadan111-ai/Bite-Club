<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\RestaurantReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RestaurantReportController extends Controller
{
    public function index(): JsonResponse
    {
        $restaurant = Auth::guard('restaurant')->user();

        if (!$restaurant) {
            return $this->unauthorizedResponse(trans('restaurant_auth.unauthorized') ?? 'Unauthorized');
        }

        $reports = RestaurantReport::where('restaurant_id', $restaurant->id)
            ->orderBy('report_date', 'desc')
            ->limit(3)
            ->get();

        return $this->successResponse(
            'Reports retrieved successfully',
            $reports
        );
    }
}
