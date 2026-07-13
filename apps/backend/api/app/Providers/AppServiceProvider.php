<?php

namespace App\Providers;

use App\Repositories\Eloquent\AdminRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Eloquent\RestaurantCategoryRepository;
<<<<<<< HEAD
use App\Repositories\Eloquent\PhoneVerificationRepository;
use App\Repositories\Interfaces\PhoneVerificationRepositoryInterface;
=======
use App\Repositories\Eloquent\RestaurantRepository;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use Illuminate\Support\ServiceProvider;
>>>>>>> origin/master

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
<<<<<<< HEAD
            PhoneVerificationRepositoryInterface::class,
            PhoneVerificationRepository::class
=======
            RestaurantRepositoryInterface::class,
            RestaurantRepository::class
>>>>>>> origin/master
        );
    }

    public function boot(): void {}
}
