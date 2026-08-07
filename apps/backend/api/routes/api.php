<?php

use \App\Http\Controllers\Api\User\UserNotificationController;
use \App\Http\Controllers\Api\Webhook\InvoiceKashierWebhookController;
use App\Http\Controllers\Api\Ai\AiChatController;

use App\Http\Controllers\Api\Ai\AiInternalToolController;
use App\Http\Controllers\Api\Ai\SmartWaiterAddToCartController;

use App\Http\Controllers\Api\Ai\SmartWaiterChatController;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\User\CartController as UserCartController;
use App\Http\Controllers\Api\User\FriendController;
use App\Http\Controllers\Api\User\GroupController;
use App\Http\Controllers\Api\User\GroupOrderController;
use App\Http\Controllers\Api\User\LeaderboardController;
use App\Http\Controllers\Api\User\OrderController as UserOrderController;
use App\Http\Controllers\Api\User\PostController;
use App\Http\Controllers\Api\User\ProfileController;
use App\Http\Controllers\Api\User\RestaurantCategoryController as UserRestaurantCategoryController;
use App\Http\Controllers\Api\User\RestaurantController as UserRestaurantController;
use App\Http\Controllers\Api\User\RestaurantMenuController as UserRestaurantMenuController;
use App\Http\Controllers\Api\User\RestaurantReviewController as UserRestaurantReviewController;
use App\Http\Controllers\Api\User\UserSearchController;
use App\Http\Controllers\Api\User\WalletController;
use App\Http\Controllers\Api\Webhook\KashierWebhookController;
use Illuminate\Support\Facades\Route;





Route::middleware('auth.restaurant')->post('/ai/chat', AiChatController::class)->name('ai.chat');
Route::middleware('auth.user')->post('/ai/smart-waiter/chat', SmartWaiterChatController::class)->name('ai.smart-waiter.chat');
Route::middleware('auth.user')->post('/ai/smart-waiter/add-to-cart', SmartWaiterAddToCartController::class)->name('ai.smart-waiter.add-to-cart');


Route::middleware('ai.internal')
    ->prefix('internal/ai/tools')
    ->name('internal.ai.tools.')
    ->group(function () {
        Route::post('/filtered-restaurants', [AiInternalToolController::class, 'filteredRestaurants'])->name('filtered-restaurants');
        Route::post('/menu', [AiInternalToolController::class, 'menu'])->name('menu');
        Route::post('/dashboard', [AiInternalToolController::class, 'dashboard'])->name('dashboard');
        Route::post('/orders', [AiInternalToolController::class, 'orders'])->name('orders');
        Route::post('/revenue', [AiInternalToolController::class, 'revenue'])->name('revenue');
        Route::post('/customers', [AiInternalToolController::class, 'customers'])->name('customers');
        Route::post('/restaurant', [AiInternalToolController::class, 'restaurant'])->name('restaurant');
        Route::post('/reviews', [AiInternalToolController::class, 'reviews'])->name('reviews');
        Route::post('/reviews-summary', [AiInternalToolController::class, 'reviewsSummary'])->name('reviews-summary');
        Route::post('/user-history', [AiInternalToolController::class, 'userHistory'])->name('user-history');
    });

Route::prefix('admin')->name('admin.')->group(function () {

    Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

    Route::middleware('auth.admin')->group(function () {
        Route::post('/logout',  [AdminAuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AdminAuthController::class, 'refresh'])->name('refresh');
        Route::get('/me',       [AdminAuthController::class, 'me'])->name('me');

        Route::prefix('restaurant-categories')->name('restaurant-categories.')->group(function () {
            Route::get('/', [RestaurantCategoryController::class, 'index'])->name('index')->withoutMiddleware('auth.admin');
            Route::get('/{id}', [RestaurantCategoryController::class, 'show'])->name('show');
            Route::post('/', [RestaurantCategoryController::class, 'store'])->name('store');
            Route::post('/{id}', [RestaurantCategoryController::class, 'update'])->name('update');
            Route::delete('/{id}', [RestaurantCategoryController::class, 'destroy'])->name('destroy');
        });
    });
});

//user auth
Route::prefix('user')->name('user.')->group(function () {
    Route::post('/register', [UserAuthController::class, 'register'])->name('register');
    Route::post('/login', [UserAuthController::class, 'login'])->name('login');
    Route::get('/verify-email/{id}/{hash}', [UserAuthController::class, 'verifyEmail'])->name('verification.verify');
    Route::post('/forgot-password', [UserAuthController::class, 'forgotPassword'])->name('password.forgot');
    Route::post('/verify-reset-otp', [UserAuthController::class, 'verifyResetOtp'])->name('password.verify-otp');
    Route::post('/reset-password', [UserAuthController::class, 'resetPassword'])->name('password.reset');

    // Public Read-Only Endpoints
    Route::get('/restaurant-categories', [UserRestaurantCategoryController::class, 'index'])->name('restaurant-categories.index');
    Route::prefix('restaurants')->group(function () {
        Route::get('/', [UserRestaurantController::class, 'index'])->name('restaurants.index');
        Route::get('nearest', [UserRestaurantController::class, 'nearest'])->name('restaurants.nearest');
        Route::get('/{restaurantId}', [UserRestaurantController::class, 'show'])->name('restaurants.show');
        Route::get('/{restaurantId}/menu', [UserRestaurantMenuController::class, 'index'])->name('restaurants.menu');
        Route::get('/{restaurantId}/reviews', [UserRestaurantReviewController::class, 'index']);
    });

    Route::middleware('auth.user')->group(function () {

        Route::post('/logout', [UserAuthController::class, 'logout'])->name('logout');

        Route::post('/refresh', [UserAuthController::class, 'refresh'])->name('refresh');

        Route::get('/me', [UserAuthController::class, 'me'])->name('me');

        Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::get('/posts', [PostController::class, 'myPosts'])->name('posts.my');

        Route::get('/posts/shareable-orders', [PostController::class, 'shareableOrders'])->name('posts.shareable-orders');

        // Reviews requiring auth
        Route::prefix('restaurants/{restaurantId}/reviews')->group(function () {
            Route::get('me', [UserRestaurantReviewController::class, 'me']);
            Route::post('/', [UserRestaurantReviewController::class, 'store']);
            Route::put('/', [UserRestaurantReviewController::class, 'update']);
            Route::delete('/', [UserRestaurantReviewController::class, 'destroy']);
        });
        Route::get('restaurants/{restaurantId}/friends-reviews', [UserRestaurantReviewController::class, 'friendsReviews']);

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/', [UserCartController::class, 'show'])->name('cart.show');
            Route::delete('/', [UserCartController::class, 'clear'])->name('cart.clear');
            Route::delete('clear', [UserCartController::class, 'clear'])->name('cart.clear.explicit');
            Route::post('merge', [UserCartController::class, 'merge'])->name('cart.merge');
            Route::post('items', [UserCartController::class, 'addItem'])->name('cart.items.add');
            Route::put('items/{itemId}', [UserCartController::class, 'updateItemQuantity'])->name('cart.items.update');
            Route::delete('items/{itemId}', [UserCartController::class, 'removeItem'])->name('cart.items.remove');
        });

        // Order
        Route::prefix('checkout')->group(function () {
            Route::post('preview', [UserOrderController::class, 'previewCheckout'])->name('checkout.preview');
            Route::post('place', [UserOrderController::class, 'placeOrder'])->name('checkout.place');
        });

        Route::get('orders', [UserOrderController::class, 'index'])->name('orders.index');
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('active', [UserOrderController::class, 'activeOrders'])->name('active');
            Route::get('past', [UserOrderController::class, 'pastOrders'])->name('past');
            Route::get('{orderId}', [UserOrderController::class, 'show'])->name('show');
            Route::post('{orderId}/cancel', [UserOrderController::class, 'cancel'])->name('cancel');
        });

        // Notifications
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [UserNotificationController::class, 'index'])->name('index');
            Route::get('/unread-count', [UserNotificationController::class, 'unreadCount'])->name('unread-count');
            Route::post('/mark-all-as-read', [UserNotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
            Route::patch('/{id}/mark-as-read', [UserNotificationController::class, 'markAsRead'])->name('mark-as-read');
        });
    });

    // Webhooks (No auth required)
    Route::post('webhooks/kashier', [\App\Http\Controllers\Api\Webhook\KashierWebhookController::class, 'handle']);

    // Group Orders module
    Route::middleware('auth.user')->prefix('group-orders')->name('group-orders.')->group(function () {
        Route::post('/', [GroupOrderController::class, 'store'])->name('store');
        Route::get('/active-sessions', [GroupOrderController::class, 'activeSessions'])->name('active-sessions');
        Route::get('/history', [GroupOrderController::class, 'history'])->name('history');
        Route::get('/{id}', [GroupOrderController::class, 'show'])->name('show');
        Route::post('/{id}/preview', [GroupOrderController::class, 'previewCheckout'])->name('preview');
        Route::post('/{id}/unlock', [GroupOrderController::class, 'unlock'])->name('unlock');
        Route::post('/{id}/cancel', [GroupOrderController::class, 'cancel'])->name('cancel');
        Route::post('/{id}/place', [GroupOrderController::class, 'placeOrder'])->name('place');
        Route::post('/{id}/items', [GroupOrderController::class, 'addItem'])->name('items.add');
        Route::put('/{id}/items/{itemId}', [GroupOrderController::class, 'updateItemQuantity'])->name('items.update');
        Route::delete('/{id}/items/{itemId}', [GroupOrderController::class, 'removeItem'])->name('items.remove');
        Route::delete('/{id}/items', [GroupOrderController::class, 'clearUserItems'])->name('items.clear');
    });
});

Route::post('webhooks/kashier/invoices', [\App\Http\Controllers\Api\Webhook\InvoiceKashierWebhookController::class, 'handle']);

// User Friends module
Route::middleware('auth.user')->prefix('friends')->name('friends.')->group(function () {
    Route::post('/request', [FriendController::class, 'sendRequest'])->name('request');
    Route::get('/requests', [FriendController::class, 'listRequests'])->name('requests');
    Route::get('/requests/sent', [FriendController::class, 'listSentRequests'])->name('requests.sent');
    Route::post('/requests/{request}/accept', [FriendController::class, 'acceptRequest'])->name('requests.accept');
    Route::post('/requests/{request}/reject', [FriendController::class, 'rejectRequest'])->name('requests.reject');
    Route::delete('/requests/{request}', [FriendController::class, 'cancelRequest'])->name('requests.cancel');
    Route::get('/', [FriendController::class, 'listFriends'])->name('index');
    Route::delete('/{user}', [FriendController::class, 'removeFriendship'])->name('destroy');
});

// Users module
Route::middleware('auth.user')->prefix('users')->name('users.')->group(function () {
    Route::get('/search', [UserSearchController::class, 'search'])->name('search');
});

// Groups module
Route::middleware('auth.user')->prefix('groups')->name('groups.')->group(function () {
    Route::post('/', [GroupController::class, 'store'])->name('store');
    // Eager match invite links before group wildcard
    Route::get('/invite/{token}', [GroupController::class, 'showInvite'])->name('invite.show');
    Route::post('/invite/{token}', [GroupController::class, 'joinByInvite'])->name('invite.join');
    Route::get('/', [GroupController::class, 'index'])->name('index');
    Route::get('/{group}', [GroupController::class, 'show'])->name('show');
    Route::post('/{group}', [GroupController::class, 'update'])->name('update'); // POST due to multipart/form-data
    Route::delete('/{group}', [GroupController::class, 'destroy'])->name('destroy');
    Route::get('/{group}/members', [GroupController::class, 'listMembers'])->name('members.index');
    Route::get('/{group}/invitable-friends', [GroupController::class, 'listInvitableFriends'])->name('members.invitable-friends');
    Route::post('/{group}/members', [GroupController::class, 'addMember'])->name('members.store');
    Route::delete('/{group}/members/{user}', [GroupController::class, 'removeMember'])->name('members.destroy');
    Route::patch('/{group}/members/{user}', [GroupController::class, 'updateMemberRole'])->name('members.update-role');
    Route::post('/{group}/leave', [GroupController::class, 'leave'])->name('leave');
    Route::patch('/{group}/join-settings', [GroupController::class, 'updateJoinSettings'])->name('join-settings');
    Route::post('/{group}/regenerate-link', [GroupController::class, 'regenerateInviteToken'])->name('regenerate-link');
});



// Social Feed module
Route::middleware('auth.user')->prefix('posts')->name('posts.')->group(function () {
    Route::get('/', [PostController::class, 'index'])->name('index');
    Route::post('/', [PostController::class, 'store'])->name('store');
    Route::get('/{postId}', [PostController::class, 'show'])->name('show');
    Route::post('/{postId}/like', [PostController::class, 'like'])->name('like');
    Route::delete('/{postId}/like', [PostController::class, 'unlike'])->name('unlike');
    Route::post('/{postId}/copy', [PostController::class, 'copyOrder'])->name('copy');
    Route::post('/copies/{copiedOrderId}/complete', [PostController::class, 'completeCopiedOrder'])->name('copies.complete');
});

// Leaderboard module
Route::middleware('auth.user')->prefix('leaderboards')->name('leaderboards.')->group(function () {
    Route::get('/', [LeaderboardController::class, 'index'])->name('index');
});

// Loyalty module
Route::middleware('auth.user')->prefix('wallet')->name('wallet.')->group(function () {
    Route::get('/', [WalletController::class, 'show'])->name('show');
    Route::get('/transactions', [WalletController::class, 'transactions'])->name('transactions');
    Route::get('/referrals', [WalletController::class, 'referrals'])->name('referrals');
    Route::get('/streak', [WalletController::class, 'streak'])->name('streak');
    Route::post('/gift', [WalletController::class, 'gift'])->name('gift');
    Route::get('/gifts', [WalletController::class, 'gifts'])->name('gifts');
    Route::get('/gift/friends', [WalletController::class, 'giftFriends'])->name('gift.friends');
});
