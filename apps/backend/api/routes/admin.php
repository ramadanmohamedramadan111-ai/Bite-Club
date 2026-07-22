<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\GeneralSettingController;
use App\Http\Controllers\Api\Admin\RestaurantController;
use App\Http\Controllers\Api\Admin\PostModerationController;
use App\Http\Controllers\Api\Admin\UserManagement\UserController;
use App\Http\Controllers\Api\Admin\UserManagement\UserBanController;

Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

Route::middleware('auth.admin')->group(function () {
    Route::post('/logout',  [AdminAuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [AdminAuthController::class, 'refresh'])->name('refresh');
    Route::get('/me',       [AdminAuthController::class, 'me'])->name('me');

    Route::prefix('restaurant-categories')->name('restaurant-categories.')->group(function () {
        Route::get('/', [RestaurantCategoryController::class, 'index'])->name('index')->withoutMiddleware('auth.admin');
        Route::get('/{id}', [RestaurantCategoryController::class, 'show'])->name('show');
        Route::post('/', [RestaurantCategoryController::class, 'store'])->name('store');
        Route::put('/{id}', [RestaurantCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [RestaurantCategoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('restaurants')->name('restaurants.')->group(function () {
        Route::get('/', [RestaurantController::class, 'index'])->name('index');
        Route::get('/{id}/available-statuses', [RestaurantController::class, 'availableTransitions'])->name('available-statuses');
        Route::put('/{id}/status', [RestaurantController::class, 'updateStatus'])->name('update-status');
    });

    Route::prefix('general-settings')->name('general-settings.')->group(function () {
        Route::get('/', [GeneralSettingController::class, 'show'])->name('show');
        Route::put('/', [GeneralSettingController::class, 'update'])->name('update');
    });

    Route::prefix('posts')->name('posts.')->group(function () {
        Route::get('/', [PostModerationController::class, 'index'])->name('index');
        Route::post('/{postId}/approve', [PostModerationController::class, 'approve'])->name('approve');
        Route::post('/{postId}/reject', [PostModerationController::class, 'reject'])->name('reject');
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/stats', [UserController::class, 'stats'])->name('stats');
        Route::get('/{id}', [UserController::class, 'show'])->name('show');
    });

    Route::prefix('user-bans')->name('user-bans.')->group(function () {
        Route::get('/', [UserBanController::class, 'index'])->name('index');
        Route::post('/', [UserBanController::class, 'store'])->name('store');
        Route::get('/{id}', [UserBanController::class, 'show'])->name('show');
        Route::patch('/{id}/lift', [UserBanController::class, 'lift'])->name('lift');
    });
});

