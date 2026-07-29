<?php

namespace App\Events;

use \App\Enums\GroupOrder\GroupOrderStatusEnum;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupOrderUnlocked implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
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
        return 'order.unlocked';
    }

    public function broadcastWith(): array
    {
        return [
            'group_order_id' => $this->groupOrderId,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'message' => 'The host has returned to the group order. The order is open again.',
        ];
    }
}
