<?php

namespace Database\Seeders;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Cart;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SmartWaiterTestUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or update test user
        $user = User::updateOrCreate(
            ['email' => 'testuser@biteclub.com'],
            [
                'first_name' => 'Ahmed',
                'last_name' => 'Hassan',
                'username' => 'ahmed_hassan',
                'password_hash' => Hash::make('password123'),
                'phone_number' => '01012345678',
                'date_of_birth' => '1995-05-15',
                'gender' => 'male',
                'status' => 'active',
                'referral_code' => 'REF-99999',
            ]
        );

        // 2. Create or find test restaurant
        $restaurant = Restaurant::updateOrCreate(
            ['name' => 'BiteClub Bistro & Grill'],
            [
                'email' => 'bistro@biteclub.com',
                'password_hash' => Hash::make('password123'),
                'phone_number' => '01099998888',
                'address' => '123 Downtown Street, Cairo',
                'status' => RestaurantStatusEnum::ACTIVE->value,
                'description' => 'Premium grill, gourmet burgers, and refreshing drinks.',
                'average_rating' => 4.8,
                'reviews_count' => 142,
                'total_orders_count' => 850,
            ]
        );

        // 3. Create Menu Categories & Items
        $catBurgers = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'title' => 'Burgers & Wraps'],
            [
                'visibility' => 'visible',
                'icon_name' => 'fast-food',
                'short_description' => 'Gourmet burgers and wraps.',
            ]
        );

        $catSides = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'title' => 'Appetizers & Sides'],
            [
                'visibility' => 'visible',
                'icon_name' => 'restaurant-menu',
                'short_description' => 'Crispy sides and starters.',
            ]
        );

        $catDrinks = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'title' => 'Beverages'],
            [
                'visibility' => 'visible',
                'icon_name' => 'wine-bar',
                'short_description' => 'Iced beverages and cold drinks.',
            ]
        );

        $catGroup = MenuCategory::updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'title' => 'Sharing Platters'],
            [
                'visibility' => 'visible',
                'icon_name' => 'group',
                'short_description' => 'Large sharing combos for groups.',
            ]
        );

        // Items
        $wrap = MenuItem::updateOrCreate(
            ['menu_category_id' => $catBurgers->id, 'title' => 'Spicy Crispy Zesty Chicken Wrap'],
            [
                'description' => 'Crispy chicken tenders wrapped with spicy garlic sauce, jalapeños, and lettuce.',
                'price' => 75.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $bbqBurger = MenuItem::updateOrCreate(
            ['menu_category_id' => $catBurgers->id, 'title' => 'Smokey BBQ Bacon Burger'],
            [
                'description' => 'Juicy beef patty with BBQ sauce, beef bacon, and melted cheddar cheese.',
                'price' => 120.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $classicBurger = MenuItem::updateOrCreate(
            ['menu_category_id' => $catBurgers->id, 'title' => 'Classic Cheeseburger'],
            [
                'description' => 'Grilled beef burger with fresh lettuce, tomato, pickles, and classic cheese sauce.',
                'price' => 85.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $fries = MenuItem::updateOrCreate(
            ['menu_category_id' => $catSides->id, 'title' => 'Golden French Fries'],
            [
                'description' => 'Crispy salted golden potato fries.',
                'price' => 25.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $wings = MenuItem::updateOrCreate(
            ['menu_category_id' => $catSides->id, 'title' => 'Spicy Buffalo Wings (6pcs)'],
            [
                'description' => 'Crispy chicken wings tossed in hot buffalo sauce.',
                'price' => 65.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $lemonade = MenuItem::updateOrCreate(
            ['menu_category_id' => $catDrinks->id, 'title' => 'Fresh Mint Lemonade'],
            [
                'description' => 'Refreshing homemade iced mint lemonade.',
                'price' => 20.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $soda = MenuItem::updateOrCreate(
            ['menu_category_id' => $catDrinks->id, 'title' => 'Cold Soda Can'],
            [
                'description' => 'Chilled soft drink.',
                'price' => 15.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $grillFeast = MenuItem::updateOrCreate(
            ['menu_category_id' => $catGroup->id, 'title' => 'BiteClub Ultimate Grill Feast'],
            [
                'description' => 'Mixed grill platter with chicken, beef skewers, fries, dips, and warm pita bread for 4-6 people.',
                'price' => 450.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        $familyBurgerCombo = MenuItem::updateOrCreate(
            ['menu_category_id' => $catGroup->id, 'title' => 'Family Burger Combo'],
            [
                'description' => '4 Cheeseburgers + 2 Large Fries + 4 Soft Drinks.',
                'price' => 380.00,
                'availability' => 'available',
                'image_url' => 'storage/menu-items/default-item.jpeg',
            ]
        );

        // 4. Create User Past Order History
        $pastOrder1 = Order::updateOrCreate(
            ['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'subtotal' => 95.00],
            [
                'order_type' => OrderTypeEnum::DELIVERY->value,
                'status' => OrderStatusEnum::COMPLETED->value,
                'delivery_fee' => 10.00,
                'service_fee' => 5.00,
                'total' => 110.00,
                'created_at' => now()->subDays(3),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $pastOrder1->id, 'item_id' => $wrap->id],
            [
                'item_name' => $wrap->title,
                'quantity' => 1,
                'price' => $wrap->price,
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $pastOrder1->id, 'item_id' => $lemonade->id],
            [
                'item_name' => $lemonade->title,
                'quantity' => 1,
                'price' => $lemonade->price,
            ]
        );

        $pastOrder2 = Order::updateOrCreate(
            ['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'subtotal' => 145.00],
            [
                'order_type' => OrderTypeEnum::DELIVERY->value,
                'status' => OrderStatusEnum::COMPLETED->value,
                'delivery_fee' => 10.00,
                'service_fee' => 5.00,
                'total' => 160.00,
                'created_at' => now()->subDays(10),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $pastOrder2->id, 'item_id' => $bbqBurger->id],
            [
                'item_name' => $bbqBurger->title,
                'quantity' => 1,
                'price' => $bbqBurger->price,
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $pastOrder2->id, 'item_id' => $fries->id],
            [
                'item_name' => $fries->title,
                'quantity' => 1,
                'price' => $fries->price,
            ]
        );

        // 5. Create Active Cart linked to Restaurant
        Cart::updateOrCreate(
            ['user_id' => $user->id],
            ['restaurant_id' => $restaurant->id]
        );
    }
}
