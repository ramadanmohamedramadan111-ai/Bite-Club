<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;
use App\Http\Controllers\Api\Admin\RestaurantController;

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
});
