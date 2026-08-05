<?php

namespace App\Http\Resources\User\GroupOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class GroupOrderResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        $totalAmount = 0;
        $usersMap = [];

        foreach ($this->items as $item) {
            $itemTotal = $item->quantity * $item->unit_price;
            $totalAmount += $itemTotal;

            $userId = 'user_' . $item->user->id;
            if (!isset($usersMap[$userId])) {
                $usersMap[$userId] = [
                    'user' => [
                        'id' => $item->user->id,
                        'name' => $item->user->full_name,
                        'is_guest' => false,
                        'profile_image' => $this->formatImageUrl($item->user->profile_image_url),
                    ],
                    'user_total' => 0,
                    'items' => [],
                ];
            }

            $usersMap[$userId]['user_total'] += $itemTotal;
            $usersMap[$userId]['items'][] = new GroupOrderItemResource($item);
        }

        if ($this->relationLoaded('guestItems') && $this->guestItems) {
            foreach ($this->guestItems as $item) {
                $itemTotal = $item->quantity * $item->unit_price;
                $totalAmount += $itemTotal;

                $userId = 'guest_' . $item->user_id;
                if (!isset($usersMap[$userId])) {
                    $usersMap[$userId] = [
                        'user' => [
                            'id' => $item->user_id,
                            'name' => $item->user_name,
                            'is_guest' => true,
                            'profile_image' => null,
                        ],
                        'user_total' => 0,
                        'items' => [],
                    ];
                }

                $usersMap[$userId]['user_total'] += $itemTotal;
                $usersMap[$userId]['items'][] = new GroupOrderItemResource($item);
            }
        }

        // Format user totals
        foreach ($usersMap as &$userData) {
            $userData['user_total'] = (float) $userData['user_total'];
        }

        return [
            'id' => $this->id,
            'status' => $this->status,
            'allow_guests' => (bool) $this->allow_guests,
            'restaurant' => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'image_url' => $this->formatImageUrl($this->restaurant->logo_url)
                    ?? $this->formatImageUrl($this->restaurant->cover_image_url),
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
