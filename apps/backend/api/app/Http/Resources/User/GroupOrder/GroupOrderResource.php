<?php

namespace App\Http\Resources\User\GroupOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $totalAmount = 0;
        $usersMap = [];

        foreach ($this->items as $item) {
            $itemTotal = $item->quantity * $item->unit_price;
            $totalAmount += $itemTotal;

            $userId = $item->user->id;
            if (!isset($usersMap[$userId])) {
                $usersMap[$userId] = [
                    'user' => [
                        'id' => $userId,
                        'name' => $item->user->full_name,
                    ],
                    'user_total' => 0,
                    'items' => [],
                ];
            }

            $usersMap[$userId]['user_total'] += $itemTotal;
            $usersMap[$userId]['items'][] = new GroupOrderItemResource($item);
        }

        // Format user totals
        foreach ($usersMap as &$userData) {
            $userData['user_total'] = (float) $userData['user_total'];
        }

        return [
            'id' => $this->id,
            'status' => $this->status,
            'restaurant' => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'image_url' => $this->restaurant->image_url,
            ],
            'host' => [
                'id' => $this->host->id,
                'name' => $this->host->full_name,
            ],
            'total_amount' => (float) $totalAmount,
            'members_summary' => array_values($usersMap),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
