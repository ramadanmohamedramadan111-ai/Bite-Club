<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\RestaurantReview;
use App\Models\User;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use Illuminate\Support\Facades\Hash;

class FiveRestaurantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed or retrieve categories
        $categories = [
            'Pizza & Pasta'  => 'pizza-and-pasta',
            'Burgers'        => 'burgers',
            'Sushi'          => 'sushi',
            'Middle Eastern' => 'middle-eastern',
            'Desserts'       => 'desserts',
        ];

        $categoryModels = [];
        foreach ($categories as $name => $slug) {
            $categoryModels[$slug] = RestaurantCategory::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'image_url' => 'storage/categories/default.jpeg',
                ]
            );
        }

        // 2. Define 5 restaurants with realistic data and distinct coordinates in Cairo
        $restaurantsData = [
            'lapiazza@biteclub.com' => [
                'name'         => 'La Piazza',
                'phone_number' => '01011111111',
                'address'      => '9 Road 9, Maadi, Cairo',
                'description'  => 'Authentic wood-fired Neapolitan pizzas and Italian pasta.',
                'category_id'  => $categoryModels['pizza-and-pasta']->id,
                'latitude'     => 30.0444,
                'longitude'    => 31.2357,
                'menu'         => [
                    'Starters' => [
                        ['title' => 'Garlic Bread', 'price' => 45.00, 'description' => 'Toasted baguette with garlic butter and herbs.'],
                        ['title' => 'Bruschetta', 'price' => 60.00, 'description' => 'Grilled bread topped with diced tomatoes, garlic, and basil.']
                    ],
                    'Wood-fired Pizzas' => [
                        ['title' => 'Margherita Pizza', 'price' => 120.00, 'description' => 'Classic pizza with fresh tomato sauce, mozzarella, and basil.'],
                        ['title' => 'Pepperoni Pizza', 'price' => 150.00, 'description' => 'Spicy pepperoni beef slices with mozzarella and tomato sauce.']
                    ],
                    'Pasta & Mains' => [
                        ['title' => 'Spaghetti Carbonara', 'price' => 140.00, 'description' => 'Spaghetti tossed with cream, parmesan, and beef bacon.'],
                        ['title' => 'Lasagna Classica', 'price' => 165.00, 'description' => 'Layered pasta sheets with minced beef bolognese and bechamel sauce.']
                    ]
                ]
            ],
            'burgerjoint@biteclub.com' => [
                'name'         => 'Burger Joint',
                'phone_number' => '01022222222',
                'address'      => '15 El-Gezira Street, Zamalek, Cairo',
                'description'  => 'Gourmet smash burgers, crispy fries, and thick craft milkshakes.',
                'category_id'  => $categoryModels['burgers']->id,
                'latitude'     => 30.0626,
                'longitude'    => 31.2223,
                'menu'         => [
                    'Smash Burgers' => [
                        ['title' => 'Classic Cheeseburger', 'price' => 110.00, 'description' => 'Single smash beef patty, cheddar, lettuce, tomato, and house sauce.'],
                        ['title' => 'Bacon BBQ Burger', 'price' => 145.00, 'description' => 'Double patty, crispy beef bacon, cheddar, onion rings, and BBQ sauce.']
                    ],
                    'Sides & Fries' => [
                        ['title' => 'Truffle Fries', 'price' => 55.00, 'description' => 'Crispy golden fries tossed with truffle oil and parmesan cheese.'],
                        ['title' => 'Onion Rings', 'price' => 45.00, 'description' => 'Crispy battered onion rings served with ranch dip.']
                    ],
                    'Milkshakes' => [
                        ['title' => 'Chocolate Milkshake', 'price' => 65.00, 'description' => 'Thick creamy milkshake made with real Swiss chocolate.'],
                        ['title' => 'Vanilla Bean Shake', 'price' => 60.00, 'description' => 'Classic shake infused with premium vanilla bean extract.']
                    ]
                ]
            ],
            'sushizen@biteclub.com' => [
                'name'         => 'Sushi Zen',
                'phone_number' => '01033333333',
                'address'      => '22 Nile City Towers, Corniche El Nil, Cairo',
                'description'  => 'Fresh premium sushi, sashimi, and traditional Japanese dishes.',
                'category_id'  => $categoryModels['sushi']->id,
                'latitude'     => 30.0712,
                'longitude'    => 31.2285,
                'menu'         => [
                    'Appetizers' => [
                        ['title' => 'Edamame', 'price' => 40.00, 'description' => 'Steamed soybean pods sprinkled with sea salt.'],
                        ['title' => 'Shrimp Tempura', 'price' => 110.00, 'description' => 'Crispy deep-fried battered shrimp served with tempura sauce.']
                    ],
                    'Sushi Rolls' => [
                        ['title' => 'California Roll', 'price' => 95.00, 'description' => 'Crab stick, avocado, cucumber, rolled with sesame seeds.'],
                        ['title' => 'Spicy Tuna Roll', 'price' => 120.00, 'description' => 'Fresh tuna tartar, spicy mayo, green onion, and cucumber.']
                    ],
                    'Sashimi & Nigiri' => [
                        ['title' => 'Salmon Sashimi', 'price' => 130.00, 'description' => '5 pieces of fresh thinly sliced salmon.'],
                        ['title' => 'Tuna Nigiri', 'price' => 90.00, 'description' => '3 pieces of fresh tuna over seasoned sushi rice.']
                    ]
                ]
            ],
            'alamir@biteclub.com' => [
                'name'         => 'Al-Amir Shawarma',
                'phone_number' => '01044444444',
                'address'      => 'El-Nasr Road, Heliopolis, Cairo',
                'description'  => 'Delicious chicken and beef shawarma wraps, grills, and garlic sauce.',
                'category_id'  => $categoryModels['middle-eastern']->id,
                'latitude'     => 30.0919,
                'longitude'    => 31.3218,
                'menu'         => [
                    'Shawarma Wraps' => [
                        ['title' => 'Chicken Shawarma Wrap', 'price' => 60.00, 'description' => 'Chicken shawarma slices, garlic paste, pickles, wrapped in shrak bread.'],
                        ['title' => 'Beef Shawarma Wrap', 'price' => 70.00, 'description' => 'Beef shawarma slices, tahini, parsley, onions, wrapped in shrak bread.']
                    ],
                    'Grills & Platters' => [
                        ['title' => 'Shish Tawook Platter', 'price' => 160.00, 'description' => 'Grilled marinated chicken skewers served with rice and garlic dip.'],
                        ['title' => 'Mix Grill Platter', 'price' => 220.00, 'description' => 'A selection of grilled kofta, shish tawook, and kebab skewers.']
                    ],
                    'Beverages' => [
                        ['title' => 'Mint Lemonade', 'price' => 35.00, 'description' => 'Freshly squeezed lemon juice blended with fresh mint leaves.'],
                        ['title' => 'Mineral Water', 'price' => 15.00, 'description' => 'Chilled local mineral water.']
                    ]
                ]
            ],
            'sweetretreat@biteclub.com' => [
                'name'         => 'Sweet Retreat',
                'phone_number' => '01055555555',
                'address'      => 'Downtown Mall, Road 90, New Cairo',
                'description'  => 'Decadent cakes, pastries, waffles, and artisanal coffee.',
                'category_id'  => $categoryModels['desserts']->id,
                'latitude'     => 30.0263,
                'longitude'    => 31.4913,
                'menu'         => [
                    'Signature Cakes' => [
                        ['title' => 'Chocolate Fudge Cake', 'price' => 75.00, 'description' => 'Rich moist chocolate cake layers covered in fudge frosting.'],
                        ['title' => 'San Sebastian Cheesecake', 'price' => 90.00, 'description' => 'Creamy basque burnt cheesecake served with warm milk chocolate.']
                    ],
                    'Waffles & Crepes' => [
                        ['title' => 'Nutella Waffle', 'price' => 80.00, 'description' => 'Freshly baked Belgian waffle topped with Nutella and fresh strawberries.'],
                        ['title' => 'Fettuccine Crepe', 'price' => 85.00, 'description' => 'Crepe sliced ribbon-style topped with three types of Belgian chocolate.']
                    ],
                    'Hot Beverages' => [
                        ['title' => 'Espresso', 'price' => 35.00, 'description' => 'Double shot of our rich specialty coffee blend.'],
                        ['title' => 'Spanish Latte', 'price' => 60.00, 'description' => 'Espresso with textured milk and sweetened condensed milk.']
                    ]
                ]
            ],
        ];

        // 3. Create dummy users for writing reviews
        $reviewers = User::factory()->count(5)->create();
        $sampleComments = [
            'Best place ever! Food was hot and delicious.',
            'Exceptional quality and fast delivery services.',
            'Loved the taste, definitely ordering again.',
            'Great experience, highly recommend trying this restaurant.',
            'Perfect and authentic taste.'
        ];

        foreach ($restaurantsData as $email => $data) {
            // Find or create restaurant
            $restaurant = Restaurant::where('email', $email)->first();
            if (!$restaurant) {
                $restaurant = Restaurant::create([
                    'name'          => $data['name'],
                    'email'         => $email,
                    'password_hash' => Hash::make('password123'),
                    'phone_number'  => $data['phone_number'],
                    'address'       => $data['address'],
                    'description'   => $data['description'],
                    'category_id'   => $data['category_id'],
                    'status'        => 'active',
                ]);
            }

            // 4. Manually create Setting & Opening Hours to bypass WithoutModelEvents trait
            $restaurant->setting()->firstOrCreate([], [
                'is_open'             => true,
                'accept_orders'       => true,
                'delivery_enabled'    => true,
                'pickup_enabled'      => true,
                'latitude'            => $data['latitude'],
                'longitude'           => $data['longitude'],
                'delivery_radius'     => 10.00,
                'delivery_fee_per_km' => 5.00,
                'deposit_threshold'   => 250.00,
                'deposit_percentage'  => 50.00,
            ]);

            if ($restaurant->openingHours()->count() === 0) {
                for ($day = 0; $day <= 6; $day++) {
                    $restaurant->openingHours()->create([
                        'day_of_week' => $day,
                        'opens_at'    => '10:00',
                        'closes_at'   => '22:00',
                        'is_closed'   => false,
                    ]);
                }
            }

            // 5. Seed realistic menus (Only if menu is empty to avoid duplicates)
            if (!MenuCategory::where('restaurant_id', $restaurant->id)->exists()) {
                foreach ($data['menu'] as $catTitle => $items) {
                    $category = MenuCategory::create([
                        'restaurant_id'     => $restaurant->id,
                        'title'             => $catTitle,
                        'icon_name'         => 'restaurant-menu',
                        'short_description' => 'Fresh and tasty selections.',
                        'visibility'        => MenuCategoryVisibilityEnum::VISIBLE->value,
                    ]);

                    foreach ($items as $itemData) {
                        MenuItem::create([
                            'menu_category_id' => $category->id,
                            'title'            => $itemData['title'],
                            'description'      => $itemData['description'],
                            'image_url'        => 'storage/menu-items/default-item.jpeg',
                            'price'            => $itemData['price'],
                            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
                        ]);
                    }
                }
            }

            // 6. Seed reviews (Only if reviews do not exist)
            if (!RestaurantReview::where('restaurant_id', $restaurant->id)->exists()) {
                $totalRating = 0;
                $reviewCount = 3;
                
                // Let 3 random reviewers write reviews
                $selectedReviewers = $reviewers->random($reviewCount);
                foreach ($selectedReviewers as $index => $user) {
                    $rating = rand(4, 5);
                    $totalRating += $rating;

                    RestaurantReview::create([
                        'restaurant_id' => $restaurant->id,
                        'user_id'       => $user->id,
                        'rating'        => $rating,
                        'comment'       => $sampleComments[rand(0, 4)],
                    ]);
                }

                // Update rating stats
                $restaurant->update([
                    'average_rating' => round($totalRating / $reviewCount, 2),
                    'reviews_count'  => $reviewCount,
                ]);
            }
        }
    }
}
