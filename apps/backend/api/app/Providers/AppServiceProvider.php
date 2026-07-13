<?php

namespace App\Providers;

use App\Repositories\Eloquent\AdminRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Eloquent\RestaurantCategoryRepository;
use App\Repositories\Eloquent\RestaurantRepository;
use App\Repositories\Eloquent\PasswordResetOtpRepository;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Repositories\Interfaces\PasswordResetOtpRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            AdminRepositoryInterface::class,
            AdminRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        $this->app->bind(
            RestaurantCategoryRepositoryInterface::class,
            RestaurantCategoryRepository::class
        );

        $this->app->bind(
            RestaurantRepositoryInterface::class,
            RestaurantRepository::class
        );

        $this->app->bind(
            PasswordResetOtpRepositoryInterface::class,
            PasswordResetOtpRepository::class
        );
    }

    public function boot(): void {}
}
