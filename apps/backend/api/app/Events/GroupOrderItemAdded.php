<?php

namespace App\Events;

use App\Http\Resources\User\GroupOrder\GroupOrderItemResource;
use App\Models\GroupOrderItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupOrderItemAdded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public \App\Models\GroupOrderItem|\App\Models\GroupOrderItemGuest $item,
        public int $groupOrderId
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('group-order.' . $this->groupOrderId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'item.added';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        if ($this->item instanceof \App\Models\GroupOrderItemGuest) {
            $this->item->loadMissing(['menuItem']);
            return [
                'item' => new GroupOrderItemResource($this->item),
                'user' => [
                    'id' => $this->item->user_id,
                    'name' => $this->item->user_name,
                    'is_guest' => true,
                ],
                'group_order_id' => $this->groupOrderId,
            ];
        }

        // Load relationships needed for the UI
        $this->item->loadMissing(['menuItem', 'user']);

        return [
            'item' => new GroupOrderItemResource($this->item),
            'user' => [
                'id' => $this->item->user->id,
                'name' => $this->item->user->full_name,
                'is_guest' => false,
            ],
            'group_order_id' => $this->groupOrderId,
        ];
    }
}
