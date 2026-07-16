<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\User\FriendController;
use App\Http\Controllers\Api\User\UserSearchController;
use App\Http\Controllers\Api\User\RestaurantCategoryController as UserRestaurantCategoryController;
use App\Http\Controllers\Api\User\RestaurantController as UserRestaurantController;

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
        Route::get('/restaurants/nearest', [UserRestaurantController::class, 'nearest'])->name('restaurants.nearest');
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
