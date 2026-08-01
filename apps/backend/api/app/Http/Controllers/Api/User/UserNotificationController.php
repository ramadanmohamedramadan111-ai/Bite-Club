<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $paginator = auth('user')->user()->notifications()->paginate($perPage);

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
        $count = auth('user')->user()->unreadNotifications()->count();

        return $this->successResponse(null, ['count' => $count]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = auth('user')->user()->notifications()->findOrFail($id);
        
        $notification->markAsRead();

        return $this->successResponse(trans('notification.marked_as_read'));
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        auth('user')->user()->unreadNotifications->markAsRead();

        return $this->successResponse(trans('notification.all_marked_as_read'));
    }
}
