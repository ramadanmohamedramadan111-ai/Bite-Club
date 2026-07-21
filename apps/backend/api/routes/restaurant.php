<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\RestaurantAuthController;
use App\Http\Controllers\Api\RestaurantSettingController;
use App\Http\Controllers\Api\Auth\RestaurantPasswordResetController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\Restaurant\OrderController;

Route::post('/register', [RestaurantAuthController::class, 'register'])->name('register');
Route::post('/login',    [RestaurantAuthController::class, 'login'])->name('login');

Route::post('/forgot-password', [RestaurantPasswordResetController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [RestaurantPasswordResetController::class, 'resetPassword'])->name('password.update');
Route::get('/categories', [RestaurantCategoryController::class, 'index'])->name('categories.index');

Route::middleware('auth.restaurant')->group(function () {
    Route::post('/logout',  [RestaurantAuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [RestaurantAuthController::class, 'refresh'])->name('refresh');
    Route::get('/me',       [RestaurantAuthController::class, 'me'])->name('me');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [RestaurantSettingController::class, 'show'])->name('show');
        Route::put('/', [RestaurantSettingController::class, 'update'])->name('update');
    });

    Route::prefix('menu-categories')->name('menu-categories.')->group(function () {
        Route::get('/', [MenuCategoryController::class, 'index'])->name('index');
        Route::post('/', [MenuCategoryController::class, 'store'])->name('store');
        Route::put('/{id}', [MenuCategoryController::class, 'update'])->name('update');
        Route::put('/{id}/visibility', [MenuCategoryController::class, 'updateVisibility'])->name('update-visibility');
        Route::delete('/{id}', [MenuCategoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('menu-items')->name('menu-items.')->group(function () {
        Route::get('/', [MenuItemController::class, 'index'])->name('index');
        Route::post('/', [MenuItemController::class, 'store'])->name('store');
        Route::post('/{id}', [MenuItemController::class, 'update'])->name('update'); // POST due to multipart/form-data
        Route::put('/{id}/availability', [MenuItemController::class, 'updateAvailability'])->name('update-availability');
        Route::delete('/{id}', [MenuItemController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/live', [OrderController::class, 'liveOrders'])->name('live');
        Route::get('/{orderId}/available-statuses', [OrderController::class, 'availableStatuses'])->name('available-statuses');
        Route::patch('/{orderId}/status', [OrderController::class, 'updateStatus'])->name('update-status');
    });
});
