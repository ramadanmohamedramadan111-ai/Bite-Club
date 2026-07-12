<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;


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
            Route::put('/{id}', [RestaurantCategoryController::class, 'update'])->name('update');
            Route::delete('/{id}', [RestaurantCategoryController::class, 'destroy'])->name('destroy');
        });
    });

});

//user auth
Route::prefix('user')->name('user.')->group(function () {

    Route::post('/register', [UserAuthController::class, 'register'])->name('register');
    Route::post('/login', [UserAuthController::class, 'login'])->name('login');

    Route::middleware('auth.user')->group(function () {

        Route::post('/logout', [UserAuthController::class, 'logout'])->name('logout');

        Route::post('/refresh', [UserAuthController::class, 'refresh'])->name('refresh');

        Route::get('/me', [UserAuthController::class, 'me'])->name('me');
    });

});
