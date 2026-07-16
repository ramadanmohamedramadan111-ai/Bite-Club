<?php

namespace App\Providers;

use App\Repositories\Eloquent\AdminRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Eloquent\RestaurantCategoryRepository;
use App\Repositories\Eloquent\RestaurantRepository;
use App\Repositories\Eloquent\PasswordResetOtpRepository;
use App\Repositories\Eloquent\RestaurantSettingRepository;
use App\Repositories\Eloquent\GeneralSettingRepository;
use App\Repositories\Eloquent\User\FriendRequestRepository;
use App\Repositories\Eloquent\User\FriendshipRepository;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;
use App\Repositories\Eloquent\MenuCategoryRepository;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use App\Repositories\Eloquent\MenuItemRepository;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Repositories\Interfaces\PasswordResetOtpRepositoryInterface;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;
use App\Repositories\Interfaces\User\FriendRequestRepositoryInterface;
use App\Repositories\Interfaces\User\FriendshipRepositoryInterface;
use App\Repositories\Interfaces\User\GroupRepositoryInterface;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;
use App\Repositories\Eloquent\User\GroupRepository;
use App\Repositories\Eloquent\User\GroupMemberRepository;
use Illuminate\Support\ServiceProvider;
use App\Models\Restaurant;
use App\Observers\RestaurantObserver;

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

        $this->app->bind(
            RestaurantSettingRepositoryInterface::class,
            RestaurantSettingRepository::class
        );

        $this->app->bind(
            GeneralSettingRepositoryInterface::class,
            GeneralSettingRepository::class
        );

        $this->app->bind(
            FriendRequestRepositoryInterface::class,
            FriendRequestRepository::class
        );

        $this->app->bind(
            FriendshipRepositoryInterface::class,
            FriendshipRepository::class
        );


        $this->app->bind(
            MenuCategoryRepositoryInterface::class,
            MenuCategoryRepository::class
        );

        $this->app->bind(
            MenuItemRepositoryInterface::class,
            MenuItemRepository::class
        );


        
        $this->app->bind(
            GroupRepositoryInterface::class,
            GroupRepository::class
        );

        $this->app->bind(
            GroupMemberRepositoryInterface::class,
            GroupMemberRepository::class
        );
    }

    public function boot(): void
    {
        Restaurant::observe(RestaurantObserver::class);
    }
}
