<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RestaurantNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $paginator = auth('restaurant')->user()->notifications()->paginate($perPage);

        $data = [
            'items' => $paginator->items(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];

        return $this->successResponse(null, $data);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = auth('restaurant')->user()->unreadNotifications()->count();

        return $this->successResponse(null, ['count' => $count]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
   
        $notification = auth('restaurant')->user()->notifications()->find($id);

        if (!$notification) {
            return $this->errorResponse(trans('notification.not_found') ?? 'Notification not found.', 404);
        }

        $notification->markAsRead();

        return $this->successResponse(trans('notification.marked_as_read'));
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        auth('restaurant')->user()->unreadNotifications->markAsRead();

        return $this->successResponse(trans('notification.all_marked_as_read'));
    }
}
