<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\User\FriendController;
use App\Http\Controllers\Api\User\UserSearchController;
use App\Http\Controllers\Api\User\GroupController;
use App\Http\Controllers\Api\User\RestaurantCategoryController as UserRestaurantCategoryController;
use App\Http\Controllers\Api\User\RestaurantController as UserRestaurantController;
use App\Http\Controllers\Api\User\RestaurantReviewController as UserRestaurantReviewController;

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

    Route::middleware('auth.user')->group(function () {

        Route::post('/logout', [UserAuthController::class, 'logout'])->name('logout');

        Route::post('/refresh', [UserAuthController::class, 'refresh'])->name('refresh');

        Route::get('/me', [UserAuthController::class, 'me'])->name('me');

        Route::get('/restaurant-categories', [UserRestaurantCategoryController::class, 'index'])->name('restaurant-categories.index');
        
        // Restaurants (User)
        Route::prefix('restaurants')->group(function () {
            Route::get('nearest', [UserRestaurantController::class, 'nearest'])->name('restaurants.nearest');
            
            // Reviews
            Route::prefix('{restaurantId}/reviews')->group(function () {
                Route::get('/', [UserRestaurantReviewController::class, 'index']);
                Route::get('me', [UserRestaurantReviewController::class, 'me']);
                Route::post('/', [UserRestaurantReviewController::class, 'store']);
                Route::put('/', [UserRestaurantReviewController::class, 'update']);
                Route::delete('/', [UserRestaurantReviewController::class, 'destroy']);
            });
        });
    });
});

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
    Route::patch('/{group}', [GroupController::class, 'update'])->name('update');
    Route::delete('/{group}', [GroupController::class, 'destroy'])->name('destroy');
    Route::get('/{group}/members', [GroupController::class, 'listMembers'])->name('members.index');
    Route::post('/{group}/members', [GroupController::class, 'addMember'])->name('members.store');
    Route::delete('/{group}/members/{user}', [GroupController::class, 'removeMember'])->name('members.destroy');
    Route::patch('/{group}/members/{user}', [GroupController::class, 'updateMemberRole'])->name('members.update-role');
    Route::post('/{group}/leave', [GroupController::class, 'leave'])->name('leave');
    Route::patch('/{group}/join-settings', [GroupController::class, 'updateJoinSettings'])->name('join-settings');
    Route::post('/{group}/regenerate-link', [GroupController::class, 'regenerateInviteToken'])->name('regenerate-link');
});

