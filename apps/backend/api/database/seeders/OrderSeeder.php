<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Post;
use App\Models\PostImage;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Social\PostStatusEnum;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            $users = User::factory()->count(5)->create();
        }

        $restaurants = Restaurant::all();
        if ($restaurants->isEmpty()) {
            $restaurants = Restaurant::factory()->count(3)->create();
        }

        $mainUser = User::where('email', 'test@example.com')->first() ?? $users->first();

        foreach ($users as $user) {
            $restaurant = $restaurants->random();
            $menuItems = MenuItem::whereHas('menuCategory', fn($q) => $q->where('restaurant_id', $restaurant->id))->get();

            if ($menuItems->isEmpty()) {
                $menuItems = MenuItem::factory()->count(3)->create();
            }

            // Create completed order
            $order = Order::create([
                'user_id'       => $user->id,
                'restaurant_id' => $restaurant->id,
                'order_type'    => OrderTypeEnum::DELIVERY->value,
                'status'        => OrderStatusEnum::COMPLETED->value,
                'subtotal'      => 45.00,
                'delivery_fee'  => 5.00,
                'service_fee'   => 2.50,
                'total'         => 52.50,
            ]);

            $selectedItems = $menuItems->take(2);
            foreach ($selectedItems as $item) {
                OrderItem::create([
                    'order_id'  => $order->id,
                    'item_id'   => $item->id,
                    'item_name' => $item->title ?? 'Delicious Item',
                    'quantity'  => rand(1, 3),
                    'price'     => $item->price ?? 22.50,
                    'notes'     => 'Extra sauce please',
                ]);
            }

            // Create approved post for social feed demonstration
            $post = Post::create([
                'user_id'       => $user->id,
                'restaurant_id' => $restaurant->id,
                'order_id'      => $order->id,
                'caption'       => "Had an incredible meal at {$restaurant->name}! Highly recommended.",
                'status'        => PostStatusEnum::APPROVED->value,
                'published_at'  => now()->subHours(rand(1, 48)),
                'expires_at'    => now()->addDays(5),
                'likes_count'   => rand(2, 10),
                'copy_count'    => rand(1, 5),
            ]);

            PostImage::create([
                'post_id'   => $post->id,
                'image_url' => 'https://picsum.photos/800/600?random=' . rand(1, 100),
                'position'  => 0,
            ]);
        }
    }
}
