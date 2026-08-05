<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupOrderUserItemsCleared implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string|int $userId,
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

    public function broadcastAs(): string
    {
        return 'user.items.cleared';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'group_order_id' => $this->groupOrderId,
        ];
    }
}
